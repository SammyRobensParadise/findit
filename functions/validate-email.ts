export default function validateEmail(email: string) {
  return email.includes('@') && email.includes('.')
}
