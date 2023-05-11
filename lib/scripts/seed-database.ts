import prisma from '../prisma'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import { UserJSON } from '@clerk/nextjs/dist/api'

dotenv.config()

const BASE_URL = `https://api.clerk.dev/v1`
