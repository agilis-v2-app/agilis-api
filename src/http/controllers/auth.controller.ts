import type { Request, Response } from 'express'
import { User } from '@models/user.model'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body
    // check both fields in a single query to return structured conflict info
    const existing = await User.find({
      $or: [{ email }, { username }]
    }).select('email username')

    if (existing && existing.length > 0) {
      const conflicts: string[] = []
      for (const u of existing) {
        if (u.email === email && !conflicts.includes('email'))
          conflicts.push('email')
        if (u.username === username && !conflicts.includes('username'))
          conflicts.push('username')
      }

      return res.status(409).json({
        message: 'Conflict: one or more fields already in use.',
        conflicts
      })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = new User({
      username,
      email,
      passwordHash
    })

    await newUser.save()

    res.status(201).json({ message: 'User registered successfully' })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error registering user.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred during registration.' })
    }
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    const token = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    )

    res.status(200).json({
      token,
      userId: user._id,
      username: user.username
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: 'Error logging in.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred during login.' })
    }
  }
}
