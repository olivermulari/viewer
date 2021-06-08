import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import FlowLines from '../flowlines/FlowLines'
import FluidSim from '../fluidsim/FluidSim'
const scenes = ["flowlines", "fluidsim"]

export default function Home({ name }) {
  const router = useRouter()
  const [navOpen, setNavOpen] = useState(false)
  const [activeScene, setActiveScene] = useState(name)

  // Create scene hook
  useEffect(() => {
    if (typeof window === "undefined") return
    let scene = null;
    switch (activeScene) {
      case "fluidsim":
        scene = new FluidSim("scene")
        break;
      case "flowlines":
      default:
        scene = new FlowLines("scene")
        break;
    }
    scene.create()
    return () => {
      scene.destroy()
    }
  }, [activeScene])

  // Get active scene from path
  useEffect(() => {
    if (typeof window === "undefined") return
    if (router?.query?.name) {
      setActiveScene(router.query.name)
    }
  }, [router])

  return (
    <div>
      <Head>
        <title>Viewer</title>
      </Head>

      <main className="relative">
        {/* Scene */}
        <div id="scene" className="w-screen h-screen" />

        {/* Nav button */}
        <button
          className="fixed top-0 right-0 mx-6 my-2 p-2 text-gray-800 text-4xl leading-none outline-none"
          onClick={() => setNavOpen(!navOpen)}
        >
          ☰
        </button>

        {/* Nav */}
        <nav className={`fixed top-0 right-0 h-screen bg-gray-800 transform transition-transform duration-200 ${navOpen ? "" : "translate-x-full"} `}>
          <button
            className="mx-4 my-2 p-2 hover:bg-gray-600 transition-colors duration-200 rounded-lg text-2xl text-white leading-none"
            onClick={() => setNavOpen(false)}
          >
            ×
          </button>
          <ul>
            {scenes.map(name => (
              <li
                key={name}
                className="px-8 py-4 cursor-pointer hover:bg-gray-600 transition-colors duration-200 rounded-lg"
                onClick={() => {router.push(`/${name}`); setNavOpen(false)}}
              >
                <p className="text-white font-bold uppercase text-lg tracking-widest">{name}</p>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  )
}

// This function gets called at build time
export async function getStaticPaths() {
  const paths = scenes.map((scene) => ({
    params: { name: scene },
  }))
  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false }
}

// This function gets called at build time
export async function getStaticProps({ params }) {
  return { props: { name: params.name } }
}
