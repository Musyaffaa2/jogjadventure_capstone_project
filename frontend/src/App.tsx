import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AuthForm from './components/AuthForm';
import Destination from './components/Destination';
import DestinationDetailPage from './components/DestinationDetailPage';
import About from './components/About';
import FAQ from './components/FAQ';
import ProfilePage from './components/Profile';
import DestinationListPage from './components/DestinationListPage'; // Ganti import

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
        <Route path="/destinations" element={<DestinationListPage />} /> 
        <Route path="/destination/:id" element={<DestinationDetailPage />} />
        <Route path="/destination" element={<Destination />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

export default App;
