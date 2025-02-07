import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";
import localFont from "next/font/local";
import { ReactPhaserBridge } from "@/game/utils/login";

const inter = Inter({ subsets: ["latin"] });
const minecraft = localFont({
  src: "./fonts/Minecraft.ttf",
  variable: "--font-minecraft",
  weight: "100 900",
});

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <>
            <Head>
                <title>Tarven</title>
                <meta name="description" content="Web3 Tarven" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className={`${styles.main} ${inter.className} ${minecraft.variable}`}>
                <AppWithoutSSR />
            </main>
        </>
    );
}
