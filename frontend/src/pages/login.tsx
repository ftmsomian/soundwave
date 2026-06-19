import Head from 'next/head'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>ورود | SoundWave</title>
      </Head>
      <LoginForm />
    </>
  )
}
