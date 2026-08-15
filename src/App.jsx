import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './components/Home.jsx'
import DropsPage from './components/DropsPage.jsx'
import GrainOverlay from './components/GrainOverlay.jsx'
import RoughEdgeFilter from './components/RoughEdgeFilter.jsx'
import ScrollManager from './components/ScrollManager.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import PageTransition from './components/PageTransition.jsx'
import BrandObject from './components/BrandObject.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import useSmoothScroll from './hooks/useSmoothScroll.js'

export default function App() {
  const location = useLocation()

  // Lenis. Must be paired with NOT setting scroll-behavior:smooth in CSS.
  useSmoothScroll()

  return (
    <>
      <LoadingScreen />

      {/* Fixed layers, in stacking order. BrandObject sits above <Routes>
          on purpose: the WebGL context is created once and survives route
          changes, so the logo holds its pose through the page wipe. */}
      <BrandObject />
      <GrainOverlay />
      <RoughEdgeFilter />
      <ScrollProgress />

      <ScrollManager />
      <Header />

      {/* mode="wait" lets the outgoing page finish its exit before the
          incoming one starts — that's what makes the wipe read as one
          movement rather than a crossfade. */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/drops"
            element={
              <PageTransition>
                <DropsPage />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>

      <Footer />
    </>
  )
}
