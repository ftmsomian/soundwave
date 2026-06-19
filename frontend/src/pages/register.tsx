import Head from 'next/head'
import { useRouter } from 'next/router'
import RegisterForm from '@/components/auth/RegisterForm'
import ArtistRegisterForm from '@/components/auth/ArtistRegisterForm'

export default function RegisterPage() {
  const router = useRouter()
  // اگه ?type=artist بود فرم هنرمند نشون بده
  const isArtist = router.query.type === 'artist'

  return (
    <>
      <Head>
        <title>{isArtist ? 'ثبت‌نام هنرمند' : 'ثبت‌نام'} | SoundWave</title>
      </Head>
      {isArtist ? <ArtistRegisterForm /> : <RegisterForm />}
    </>
  )
}
