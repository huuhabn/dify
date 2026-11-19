import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('console_token')?.value;

  if (!token) {
    redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/apps');
  }
}
