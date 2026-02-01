import './global.css';
import Header from "../shared/widgets";
import { Roboto,Poppins } from 'next/font/google'

export const metadata = {
  title: 'Eshop',
  description: 'E-commerce',
}

const roboto = Roboto({
    weight: ["100","200","300",'400', "500", "700", "800", "900"],
    subsets: ['latin'],
    variable: "--font-roboto"
})
const poppins = Poppins({
    weight: ["100","200","300",'400', "500", "700", "800", "900"],
    subsets: ['latin'],
    variable: "--font-poppins"
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable}`}>
      <Header/>
      {children}</body>
    </html>
  )
}
