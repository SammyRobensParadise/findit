import prisma from '../prisma'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

dotenv.config()

const BASE_URL = `https://api.clerk.dev/v1`
