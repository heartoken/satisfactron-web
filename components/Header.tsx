import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-10">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/heartoken.png"
              alt="Heartoken Logo"
              width={28}
              height={28}
              priority
            />
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              Heartoken
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}