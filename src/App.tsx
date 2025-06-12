import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Rekomendasi from './components/Rekomendasi';
import AuthForm from './components/AuthForm';
import Destination from './components/Destination';
import DestinationCard from './components/DestinationCard';
import About from './components/About';
import FAQ from './components/FAQ';
import Chatbot from './components/Chatbot';

function Home() {
  return (
    <>
        <Navbar />
        <Hero />
    </>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AuthForm" element={<AuthForm />} />
        <Route path="/destination/:id" element={<DestinationCard />} />
        <Route path="/destination" element={<Destination />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
      <Chatbot />
    </>
  );
}

export default App;
