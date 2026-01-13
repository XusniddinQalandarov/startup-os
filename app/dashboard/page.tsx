import { redirect } from 'next/navigation'

export default function DashboardPage() {
    // Redirect to profile page - dashboard is now integrated into profile
    redirect('/profile')
}
