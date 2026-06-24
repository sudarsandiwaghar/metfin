import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Truck, 
  Award, 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  X, 
  Check, 
  Scale, 
  Menu, 
  Calculator, 
  Download, 
  Copy, 
  ExternalLink 
} from 'lucide-react';

// REAL COMPANY DETAILS (strictly as-is)
const COMPANY_NAME = "MetFin India Steel";
const SUBTITLE = "Mfrs. Bright Steel Bars";
const PARTNER = "C Diwaghar";
const ADDRESS = "Plot No. 8, Survey No. 34/1, Vanagaram – Ambattur Road, Ayanambakkam, Chennai – 600 095";
const MOBILE = "98400 46236";
const EMAIL = "metfin.bright@gmail.com";
const GSTIN = "33AAFM8082C1ZU";
const TAGLINE = "From Black Bar to Bright Bar — Precision at Every Draw";

// Steel grades density factors (relative to standard steel ~7.85g/cm³)
const STEEL_GRADES = [
  { name: "EN 8 (Carbon Steel)", density: 7.85 },
  { name: "EN 24 (Alloy Steel)", density: 7.85 },
  { name: "EN 31 (Alloy Steel)", density: 7.81 },
  { name: "SAE 1040", density: 7.85 },
  { name: "EN 1A (Free Cutting)", density: 7.85 },
  { name: "SS 304 (Stainless)", density: 7.93 },
  { name: "Mild Steel (MS)", density: 7.85 },
];

export default function App() {
  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quote Request Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    shape: 'round',
    size: '',
    quantity: '',
    grade: 'EN 8 (Carbon Steel)',
    message: ''
  });

  // Interactive Weight Calculator states
  const [calcShape, setCalcShape] = useState<'round' | 'square' | 'hex' | 'flat'>('round');
  const [calcSize, setCalcSize] = useState<number>(25); // diameter/width in mm
  const [calcThickness, setCalcThickness] = useState<number>(10); // for Flat bars (thickness in mm)
  const [calcWidth, setCalcWidth] = useState<number>(50); // for Flat bars (width in mm)
  const [calcLength, setCalcLength] = useState<number>(6); // length in meters
  const [calcQuantity, setCalcQuantity] = useState<number>(50); // number of bars
  const [calcGrade, setCalcGrade] = useState<string>('EN 8 (Carbon Steel)');
  const [calculatedWeight, setCalculatedWeight] = useState<number>(0);
  const [calculatedTotalWeight, setCalculatedTotalWeight] = useState<number>(0);

  // Active navigation section state (scroll spy)
  const [activeSection, setActiveSection] = useState('home');
  const [headerScrolled, setHeaderScrolled] = useState(false);

  // Quick weight calculator copies/exports notification
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Ref for the 3D metal cylinder interaction
  const cylinderRef = useRef<HTMLDivElement>(null);
  const [cylinderRotate, setCylinderRotate] = useState({ x: 10, y: -12 });

  // Handle header background & scroll spy
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 60);

      const sections = ['home', 'process', 'products', 'calculator', 'why', 'contact'];
      const scrollPos = window.scrollY + 150;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interactivity for the rotating steel bar cylinder (mouse tilt effect)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cylinderRef.current) return;
    const rect = cylinderRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Convert coordinate offset to slight rotation range
    const rotY = (mouseX / (width / 2)) * 40; // max 40 deg Y tilt
    const rotX = -(mouseY / (height / 2)) * 30; // max 30 deg X tilt
    setCylinderRotate({ x: rotX + 10, y: rotY - 12 });
  };

  const handleMouseLeave = () => {
    setCylinderRotate({ x: 10, y: -12 });
  };

  // Perform Steel Weight Calculations
  useEffect(() => {
    // Find selected grade density factor
    const selectedGradObj = STEEL_GRADES.find(g => g.name === calcGrade);
    const densityFactor = selectedGradObj ? selectedGradObj.density : 7.85;

    let singleWeight = 0; // weight of a single bar in kg

    if (calcShape === 'round') {
      // Area = PI * r^2
      // Volume = Area * Length
      // weight = Volume * density
      // Formula: Dia^2 * 0.00617 * length (standard industry shortcut for steel)
      // Standard Density Weight = (Dia^2 * PI / 4) * length * density_g_cm3 * 10^-3
      const d = calcSize;
      const area = (Math.PI * Math.pow(d, 2)) / 4;
      singleWeight = (area * calcLength * densityFactor) / 1000;
    } else if (calcShape === 'square') {
      // Area = size * size
      // Formula: Size^2 * 0.00785 * length
      const s = calcSize;
      const area = Math.pow(s, 2);
      singleWeight = (area * calcLength * densityFactor) / 1000;
    } else if (calcShape === 'hex') {
      // Area of regular hexagon = 2.598 * s^2 (where s is side length)
      // Size input is A/F (Across Flats), side = (A/F) / sqrt(3)
      // Area = 0.866025 * (A/F)^2
      // Formula: HexSize^2 * 0.006798 * length
      const h = calcSize;
      const area = 0.866025 * Math.pow(h, 2);
      singleWeight = (area * calcLength * densityFactor) / 1000;
    } else if (calcShape === 'flat') {
      // Area = width * thickness
      // Formula: Width * Thickness * 0.00785 * length
      const area = calcWidth * calcThickness;
      singleWeight = (area * calcLength * densityFactor) / 1000;
    }

    const totalWeight = singleWeight * calcQuantity;
    setCalculatedWeight(Number(singleWeight.toFixed(3)));
    setCalculatedTotalWeight(Number(totalWeight.toFixed(2)));
  }, [calcShape, calcSize, calcThickness, calcWidth, calcLength, calcQuantity, calcGrade]);

  // Smooth scroll to element
  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Pre-select shape from product click
  const selectShapeFromProduct = (shape: 'round' | 'square' | 'hex' | 'flat', defaultSize: number) => {
    setCalcShape(shape);
    setCalcSize(defaultSize);
    if (shape === 'flat') {
      setCalcWidth(50);
      setCalcThickness(10);
    }
    scrollTo('calculator');
  };

  // Submit quote form
  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalSuccess(true);
    // In production, this would integrate with a backend route or email API
    console.log("Quote Request Submitted:", quoteForm);
  };

  // Quick form in contact section
  const [quickContactSubmitted, setQuickContactSubmitted] = useState(false);
  const [quickForm, setQuickForm] = useState({ name: '', phone: '', grade: 'EN 8', message: '' });
  
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickContactSubmitted(true);
    setTimeout(() => {
      setQuickContactSubmitted(false);
      setQuickForm({ name: '', phone: '', grade: 'EN 8', message: '' });
    }, 4000);
  };

  // Copy results of weight calculator to clipboard
  const copyCalculatorResults = () => {
    const textToCopy = `MetFin India Steel - Bright Bar Weight Calculation
--------------------------------------------------
Shape: ${calcShape.toUpperCase()} Bar
Grade: ${calcGrade}
Dimensions: ${calcShape === 'flat' ? `${calcWidth}mm x ${calcThickness}mm` : `${calcSize}mm`}
Length: ${calcLength} Meters
Quantity: ${calcQuantity} Bars
--------------------------------------------------
Single Bar Weight: ${calculatedWeight} kg
Total Consignment Weight: ${calculatedTotalWeight} kg
--------------------------------------------------
Get a custom wholesale quote at: metfin.bright@gmail.com`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#050505] text-[#e8e8e8] font-sans relative overflow-hidden flex flex-col">
      {/* Background grid pattern */}
      <div className="bg-grid absolute inset-0 pointer-events-none z-0"></div>

      {/* Sophisticated Dark Glow Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7B52AB]/15 blur-[120px] rounded-full -mr-32 -mt-32 z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-[#2196F3]/5 blur-[120px] rounded-full -ml-40 z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#F5C800]/5 blur-[100px] rounded-full -mr-32 -mb-32 z-0 pointer-events-none"></div>

      {/* HEADER NAVIGATION */}
      <header id="header" className={`relative z-50 flex items-center justify-between px-6 md:px-12 py-6 border-b border-[#111] transition-all duration-300 ${headerScrolled ? 'sticky top-0 bg-[#050505]/95 backdrop-blur-md shadow-[0_1px_15px_rgba(0,0,0,0.8)]' : ''}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('home')}>
          {/* Custom logo hexagon vector icon */}
          <div className="w-9 h-9 border-2 border-[#7B52AB] transform rotate-45 flex items-center justify-center transition-transform hover:rotate-[135deg] duration-500">
            <div className="w-4 h-4 bg-[#F5C800] flex items-center justify-center transform -rotate-45">
              <div className="w-1.5 h-1.5 bg-[#2196F3]"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold tracking-tighter uppercase font-display leading-none">
              METFIN <span className="text-[#7B52AB]">INDIA</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#555] uppercase leading-none mt-1">
              Bright Steel Bars
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-mono tracking-widest uppercase">
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }} className={`transition-colors hover:text-[#F5C800] ${activeSection === 'home' ? 'text-[#F5C800] font-semibold' : 'text-[#888]'}`}>HOME</a>
          <a href="#process" onClick={(e) => { e.preventDefault(); scrollTo('process'); }} className={`transition-colors hover:text-[#F5C800] ${activeSection === 'process' ? 'text-[#F5C800] font-semibold' : 'text-[#888]'}`}>PROCESS</a>
          <a href="#products" onClick={(e) => { e.preventDefault(); scrollTo('products'); }} className={`transition-colors hover:text-[#F5C800] ${activeSection === 'products' ? 'text-[#F5C800] font-semibold' : 'text-[#888]'}`}>PRODUCTS</a>
          <a href="#calculator" onClick={(e) => { e.preventDefault(); scrollTo('calculator'); }} className={`transition-colors hover:text-[#F5C800] ${activeSection === 'calculator' ? 'text-[#F5C800] font-semibold' : 'text-[#888]'}`}>WEIGHT CALC</a>
          <a href="#why" onClick={(e) => { e.preventDefault(); scrollTo('why'); }} className={`transition-colors hover:text-[#F5C800] ${activeSection === 'why' ? 'text-[#F5C800] font-semibold' : 'text-[#888]'}`}>WHY METFIN</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }} className={`transition-colors hover:text-[#F5C800] ${activeSection === 'contact' ? 'text-[#F5C800] font-semibold' : 'text-[#888]'}`}>CONTACT</a>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setModalOpen(true)} className="hidden sm:inline-flex px-5 py-2.5 border border-[#7B52AB] hover:border-[#F5C800] text-xs font-mono uppercase tracking-widest hover:bg-[#7B52AB] transition-all hover:shadow-[0_0_15px_rgba(123,82,171,0.4)] text-white">
            Get Quote
          </button>
          
          {/* Mobile menu trigger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-[#e8e8e8] hover:text-[#F5C800] transition-colors" aria-label="Toggle navigation">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#050505]/98 backdrop-blur-lg flex flex-col justify-center px-12 py-10 transition-all duration-300">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white" aria-label="Close menu">
            <X size={28} />
          </button>
          
          <div className="flex flex-col gap-8 text-xl font-mono tracking-widest uppercase text-center">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }} className="hover:text-[#F5C800] py-2 border-b border-white/5">HOME</a>
            <a href="#process" onClick={(e) => { e.preventDefault(); scrollTo('process'); }} className="hover:text-[#F5C800] py-2 border-b border-white/5">PROCESS</a>
            <a href="#products" onClick={(e) => { e.preventDefault(); scrollTo('products'); }} className="hover:text-[#F5C800] py-2 border-b border-white/5">PRODUCTS</a>
            <a href="#calculator" onClick={(e) => { e.preventDefault(); scrollTo('calculator'); }} className="hover:text-[#F5C800] py-2 border-b border-white/5">WEIGHT CALC</a>
            <a href="#why" onClick={(e) => { e.preventDefault(); scrollTo('why'); }} className="hover:text-[#F5C800] py-2 border-b border-white/5">WHY METFIN</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }} className="hover:text-[#F5C800] py-2">CONTACT</a>
            
            <button onClick={() => { setMobileMenuOpen(false); setModalOpen(true); }} className="mt-4 px-8 py-4 bg-[#7B52AB] text-white text-sm font-mono uppercase tracking-widest hover:brightness-110">
              Request wholesale quote
            </button>
          </div>
          <div className="mt-12 text-center text-xs text-gray-500 font-mono">
            M: {MOBILE} <span className="mx-2">•</span> Chennai, India
          </div>
        </div>
      )}

      {/* MAIN HERO CONTENT */}
      <section id="home" className="relative min-h-[90vh] flex items-center px-6 md:px-12 lg:px-24 py-12 md:py-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-7xl mx-auto">
          
          {/* Hero text */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-6 border border-[#1a1a1a] rounded-full bg-[#0d0d0d] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <span className="w-2 h-2 rounded-full bg-[#F5C800] animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-[#F5C800] -ml-4"></span>
              <span className="text-[10px] md:text-xs font-mono tracking-[0.25em] text-[#F5C800] uppercase">CHENNAI'S BRIGHT BAR EXPERTS ≋</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.0] tracking-tight mb-6 uppercase text-[#e8e8e8] font-display">
              BRIGHT STEEL<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B52AB] via-[#2196F3] to-[#7B52AB] bg-size-200">PRECISION</span> DRAWN
            </h1>
            
            <p className="text-sm md:text-base leading-relaxed text-gray-400 max-w-xl mb-8">
              Chennai's trusted manufacturer of cold-drawn, turned, and polished bright steel bars. 
              From raw black bar to high-mirror finish steel — engineered to tight tolerances for auto-components, hydraulics, and demanding machinery fabrication.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setModalOpen(true)} className="px-8 py-4 bg-[#7B52AB] hover:bg-[#7B52AB]/90 text-white text-xs font-mono uppercase tracking-widest hover:shadow-[0_0_25px_rgba(123,82,171,0.5)] hover:scale-[1.02] transition-all">
                Request Quote &gt;
              </button>
              <button onClick={() => scrollTo('products')} className="px-8 py-4 border border-[#555] hover:border-[#F5C800] hover:text-[#F5C800] text-xs font-mono uppercase tracking-widest transition-all">
                View Products &gt;
              </button>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-xs font-mono text-[#555]">
              <div className="flex items-center gap-2">
                <span className="text-[#7B52AB]">▪</span> PARTNER: {PARTNER}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#2196F3]">▪</span> GSTIN: {GSTIN}
              </div>
            </div>
          </div>

          {/* Interactive 3D element */}
          <div className="lg:col-span-5 flex justify-center items-center py-8">
            <div className="relative" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              {/* Custom metal cylinder with interactive rotation */}
              <div 
                ref={cylinderRef}
                className="w-[110px] h-[440px] md:h-[480px] bg-gradient-to-r from-[#111] via-[#C0C0C0] to-[#111] rounded-full shadow-[0_0_100px_rgba(123,82,171,0.35)] border-x border-white/10 relative transition-transform duration-200 ease-out"
                style={{
                  transform: `rotateY(${cylinderRotate.y}deg) rotateX(${cylinderRotate.x}deg)`,
                  transformStyle: 'preserve-3d',
                  backgroundImage: 'linear-gradient(90deg, #111111 0%, #333333 15%, #999999 35%, #C0C0C0 50%, #fefefe 65%, #888888 80%, #111111 100%)'
                }}
              >
                {/* 3D end cap reflection */}
                <div className="absolute top-0 left-0 right-0 h-[55px] bg-gradient-to-b from-white/60 to-transparent rounded-t-full opacity-60"></div>
                <div className="absolute top-4 left-6 right-6 h-1 bg-white/40 rounded-full blur-[1px]"></div>
                
                {/* Laser branding mark */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none opacity-40 select-none">
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-black font-semibold rotate-90">METFIN BRIGHT</span>
                  <div className="w-1.5 h-16 bg-[#F5C800]/50 mt-10"></div>
                </div>
              </div>

              {/* Orbital rings */}
              <div className="absolute -bottom-6 -right-6 w-28 h-28 border border-[#F5C800] rounded-full flex items-center justify-center opacity-30 animate-spin" style={{ animationDuration: '12s' }}>
                <div className="w-20 h-20 border border-[#2196F3] rounded-full opacity-50 animate-ping" style={{ animationDuration: '6s' }}></div>
              </div>
              
              <div className="absolute -top-6 -left-6 w-16 h-16 border border-[#7B52AB]/40 rounded-full flex items-center justify-center opacity-50 animate-bounce" style={{ animationDuration: '8s' }}>
                <div className="w-3 h-3 bg-[#7B52AB]/60 rounded-full"></div>
              </div>

              {/* Drag indicator instruction */}
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#555] tracking-widest uppercase bg-black/60 px-3 py-1 rounded-full border border-[#222]">
                Hover to Rotate Bar
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: TRANSFORMATION PROCESS */}
      <section id="process" className="process-section reveal py-24 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="section-eyebrow">HOW WE DO IT</p>
          <h2>Black Bar → Bright Bar</h2>
          <p className="section-sub text-gray-500 max-w-md mx-auto">Four precision stages. Zero compromise on tolerances.</p>
          
          <div className="process-steps">
            <div className="step group">
              <span className="step-number">01</span>
              <h4>RAW BLACK BAR</h4>
              <p>Hot-rolled steel billets carefully sourced from certified premium steel mills.</p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#7B52AB] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="step-connector hidden md:block"></div>
            
            <div className="step group">
              <span className="step-number">02</span>
              <h4>ANNEALING</h4>
              <p>Heat-treated and stress-relieved inside controlled atmospheric furnaces.</p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#2196F3] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="step-connector hidden md:block"></div>
            
            <div className="step group">
              <span className="step-number">03</span>
              <h4>COLD DRAWING</h4>
              <p>Precision die-drawn under high tension for extreme dimensional accuracy.</p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#F5C800] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="step-connector hidden md:block"></div>
            
            <div className="step highlight-step group">
              <span className="step-number">04</span>
              <h4 className="text-[#F5C800]">BRIGHT BAR</h4>
              <p>Thoroughly turned, ground, and polished to achieve a mirror finish of Ra ≤ 0.8μm.</p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#F5C800] to-transparent scale-x-100"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PRODUCT RANGE */}
      <section id="products" className="products-section py-24 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="section-eyebrow">WHAT WE MAKE</p>
          <h2>PRODUCT RANGE</h2>
          <p className="section-sub text-gray-500 mb-12">Click on any profile to load it into the custom interactive weight calculator below.</p>
          
          <div className="products-grid">

            <div className="product-card group" onClick={() => selectShapeFromProduct('round', 25)}>
              <div className="product-shape round-shape group-hover:scale-110 transition-transform duration-300"></div>
              <h3>ROUND BARS</h3>
              <p>Ø 5mm – 100mm diameter range. Extensively used in shafting, fastners, auto axles.</p>
              <div className="spec-tag">EN 8 · EN 24 · EN 31 · SAE 1040</div>
              <div className="mt-4 text-xs font-mono text-[#7B52AB] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Load Weight Calc <ChevronRight size={14} />
              </div>
            </div>

            <div className="product-card group" onClick={() => selectShapeFromProduct('square', 20)}>
              <div className="product-shape square-shape group-hover:scale-110 transition-transform duration-300"></div>
              <h3>SQUARE BARS</h3>
              <p>5mm – 80mm square sections. Ideal for machine structures, keys, and component frames.</p>
              <div className="spec-tag">EN 8 · MS · Alloy grades</div>
              <div className="mt-4 text-xs font-mono text-[#7B52AB] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Load Weight Calc <ChevronRight size={14} />
              </div>
            </div>

            <div className="product-card group" onClick={() => selectShapeFromProduct('hex', 19)}>
              <div className="product-shape hex-shape group-hover:scale-110 transition-transform duration-300"></div>
              <h3>HEX BARS</h3>
              <p>A/F 6mm – 75mm hexagon sections. Perfect for high-speed CNC machining of nuts and bolts.</p>
              <div className="spec-tag">Free cutting · EN 1A · SS 304</div>
              <div className="mt-4 text-xs font-mono text-[#7B52AB] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Load Weight Calc <ChevronRight size={14} />
              </div>
            </div>

            <div className="product-card group" onClick={() => selectShapeFromProduct('flat', 40)}>
              <div className="product-shape flat-shape group-hover:scale-110 transition-transform duration-300"></div>
              <h3>FLAT BARS</h3>
              <p>Custom width × thickness profiles. Precision sheared edges for slides, guides and keys.</p>
              <div className="spec-tag">MS · EN 8 · Spring steel</div>
              <div className="mt-4 text-xs font-mono text-[#7B52AB] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Load Weight Calc <ChevronRight size={14} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* INTERACTIVE WEIGHT CALCULATOR SECTION */}
      <section id="calculator" className="calc-section py-24 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="section-eyebrow">PROCUREMENT UTILITY</p>
            <h2>Steel Weight Calculator</h2>
            <p className="section-sub text-gray-500 max-w-xl mx-auto">
              Configure parameters to estimate custom bright steel consignment weight based on profile geometric formulas.
            </p>
          </div>

          <div className="calc-grid">
            
            {/* Input card */}
            <div className="calc-card shadow-2xl relative">
              <div className="absolute top-4 right-4 flex items-center gap-2 text-[#555] text-xs font-mono">
                <Calculator size={14} className="text-[#7B52AB]" /> LIVE ESTIMATE
              </div>
              
              <div className="calc-form">
                
                {/* Shape select */}
                <div className="form-group">
                  <label className="calc-label">1. BAR GEOMETRIC PROFILE</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                    {(['round', 'square', 'hex', 'flat'] as const).map((shape) => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => setCalcShape(shape)}
                        className={`py-3 px-2 text-xs font-mono tracking-wider uppercase border rounded-md transition-all ${calcShape === shape ? 'bg-[#7B52AB]/10 border-[#7B52AB] text-white font-bold' : 'border-[#1a1a1a] text-gray-500 hover:border-gray-700'}`}
                      >
                        {shape} Bar
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensions */}
                <div className="form-row">
                  {calcShape !== 'flat' ? (
                    <div className="form-group">
                      <label className="calc-label">
                        {calcShape === 'round' ? 'DIAMETER' : calcShape === 'square' ? 'SQUARE SIZE' : 'A/F HEX SIZE'} (mm)
                      </label>
                      <input 
                        type="number" 
                        className="calc-input"
                        value={calcSize || ''} 
                        onChange={(e) => setCalcSize(Math.max(0, Number(e.target.value)))}
                        min="1"
                        max="250"
                      />
                      <span className="text-[10px] text-gray-600 font-mono">Range: 5mm - 200mm</span>
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="calc-label">FLAT WIDTH (mm)</label>
                        <input 
                          type="number" 
                          className="calc-input"
                          value={calcWidth || ''} 
                          onChange={(e) => setCalcWidth(Math.max(0, Number(e.target.value)))}
                          min="1"
                        />
                        <span className="text-[10px] text-gray-600 font-mono">E.g., 20mm - 150mm</span>
                      </div>
                      <div className="form-group">
                        <label className="calc-label">FLAT THICKNESS (mm)</label>
                        <input 
                          type="number" 
                          className="calc-input"
                          value={calcThickness || ''} 
                          onChange={(e) => setCalcThickness(Math.max(0, Number(e.target.value)))}
                          min="1"
                        />
                        <span className="text-[10px] text-gray-600 font-mono">E.g., 3mm - 40mm</span>
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label className="calc-label">BAR LENGTH (Meters)</label>
                    <input 
                      type="number" 
                      className="calc-input"
                      value={calcLength || ''} 
                      onChange={(e) => setCalcLength(Math.max(0, Number(e.target.value)))}
                      min="0.1"
                      step="0.1"
                    />
                    <span className="text-[10px] text-gray-600 font-mono">Standard stock length: 6m</span>
                  </div>
                </div>

                {/* Grade and count */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="calc-label">2. STEEL GRADE SPECIFICATION</label>
                    <select 
                      className="calc-select"
                      value={calcGrade}
                      onChange={(e) => setCalcGrade(e.target.value)}
                    >
                      {STEEL_GRADES.map((grade) => (
                        <option key={grade.name} value={grade.name} className="bg-[#0d0d0d] text-white">
                          {grade.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-gray-600 font-mono">Impacts alloy density factors</span>
                  </div>

                  <div className="form-group">
                    <label className="calc-label">CONSIGNMENT QUANTITY (Bars)</label>
                    <input 
                      type="number" 
                      className="calc-input"
                      value={calcQuantity || ''} 
                      onChange={(e) => setCalcQuantity(Math.max(0, Number(e.target.value)))}
                      min="1"
                    />
                    <span className="text-[10px] text-gray-600 font-mono">Enter quantity of bright bars</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Results card */}
            <div className="calc-results relative flex flex-col items-center justify-center p-8 bg-[#0a0a0a] border border-[#1a1a1a]">
              <div className="z-10">
                <div className="text-xs font-mono tracking-widest text-[#7B52AB] uppercase mb-2">CALCULATED TOTAL</div>
                
                <div className="result-val mb-1">{calculatedTotalWeight.toLocaleString()}</div>
                <div className="text-sm font-mono text-[#F5C800] uppercase tracking-wider mb-6">KG (Kilograms)</div>
                
                <div className="w-full h-[1px] bg-[#1a1a1a] my-4"></div>

                <div className="grid grid-cols-2 gap-4 text-left my-4">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">Single Bar Weight</span>
                    <span className="text-sm font-mono text-white font-semibold">{calculatedWeight} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">Metric Tons (MT)</span>
                    <span className="text-sm font-mono text-[#2196F3] font-semibold">{(calculatedTotalWeight / 1000).toFixed(4)} MT</span>
                  </div>
                </div>

                <p className="result-meta text-xs text-gray-500 max-w-xs mx-auto mb-6">
                  *Geometric calculation based on volume density constant (~{STEEL_GRADES.find(g => g.name === calcGrade)?.density || 7.85}g/cm³). Standard mill tolerances (H9 - H11) can affect exact mass delivery.
                </p>

                <div className="flex gap-2 w-full justify-center">
                  <button 
                    onClick={copyCalculatorResults} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] hover:bg-zinc-800 text-xs font-mono text-gray-300 transition-colors uppercase border border-[#222]"
                  >
                    <Copy size={12} /> {copiedNotification ? 'Copied!' : 'Copy Specs'}
                  </button>
                  <button 
                    onClick={() => {
                      setQuoteForm(prev => ({
                        ...prev,
                        shape: calcShape,
                        size: calcShape === 'flat' ? `${calcWidth}x${calcThickness}` : String(calcSize),
                        quantity: String(calcQuantity),
                        grade: calcGrade
                      }));
                      setModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#7B52AB]/20 hover:bg-[#7B52AB]/40 text-xs font-mono text-[#e8e8e8] transition-colors uppercase border border-[#7B52AB]/50"
                  >
                    Add to Quote Request
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: STATS COUNTERS */}
      <section className="stats-section border-y border-[#1a1a1a] bg-[#080808]/80 backdrop-blur-md">
        <div className="stat">
          <div className="stat-value text-transparent bg-clip-text bg-gradient-to-b from-[#7B52AB] to-[#2196F3]">500</div>
          <div className="stat-unit">MT/MONTH</div>
          <div className="stat-label">Production Capacity</div>
        </div>
        <div className="stat">
          <div className="stat-value text-transparent bg-clip-text bg-gradient-to-b from-[#7B52AB] to-[#2196F3]">40+</div>
          <div className="stat-unit">ALLOY SPECIFICATIONS</div>
          <div className="stat-label">Steel Grades</div>
        </div>
        <div className="stat">
          <div className="stat-value text-transparent bg-clip-text bg-gradient-to-b from-[#7B52AB] to-[#2196F3]">5μm</div>
          <div className="stat-unit">TIGHT LIMITS</div>
          <div className="stat-label">Dimensional Tolerance</div>
        </div>
        <div className="stat">
          <div className="stat-value text-transparent bg-clip-text bg-gradient-to-b from-[#7B52AB] to-[#2196F3]">15+</div>
          <div className="stat-unit">ESTABLISHED EXPERIENCE</div>
          <div className="stat-label">Industry History</div>
        </div>
      </section>

      {/* SECTION 5: INDUSTRIES MARQUEE */}
      <section className="marquee-strip">
        <div className="marquee-track">
          <span className="marquee-item">AUTOMOTIVE COMPONENTS</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">HYDRAULIC CYLINDERS</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">MACHINE TOOLS</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">DEFENCE ENGINEERING</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">PUMP INDUSTRY</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">FASTENERS MANUFACTURING</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">OIL & GAS COUPLINGS</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">AEROSPACE CLAMPS</span>
          <span className="marquee-dot">•</span>
          
          {/* Duplicate set for seamless scrolling */}
          <span className="marquee-item">AUTOMOTIVE COMPONENTS</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">HYDRAULIC CYLINDERS</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">MACHINE TOOLS</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">DEFENCE ENGINEERING</span>
          <span className="marquee-dot">•</span>
          <span className="marquee-item">PUMP INDUSTRY</span>
          <span className="marquee-dot">•</span>
        </div>
      </section>

      {/* SECTION 6: WHY METFIN ADVANTAGE */}
      <section id="why" className="why-section py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="section-eyebrow">WHY CHOOSE US</p>
          <h2>THE METFIN ADVANTAGE</h2>
          <p className="section-sub text-gray-500 max-w-lg mb-12">Consistently exceeding precision requirements across industrial manufacturing sectors.</p>
          
          <div className="why-grid">
            <div className="why-card group">
              <div className="why-icon">
                <Settings className="w-10 h-10 text-[#7B52AB] transition-transform duration-500 group-hover:rotate-90" />
              </div>
              <h4>COLD DRAWN PRECISION</h4>
              <p>Multi-pass high precision drawing dies produce extremely uniform dimensional specifications and smooth outer bar profiles.</p>
            </div>
            
            <div className="why-card group">
              <div className="why-icon">
                <Award className="w-10 h-10 text-[#F5C800] transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h4>SURFACE FINISH Ra ≤ 0.8μm</h4>
              <p>Rotary turned, polished and centerless ground to achieve pristine outer bar surfaces free of scaling and micro-abrasions.</p>
            </div>
            
            <div className="why-card group">
              <div className="why-icon">
                <ShieldCheck className="w-10 h-10 text-[#2196F3] transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h4>MILL TEST CERTIFIED</h4>
              <p>Every consignment is accompanied by fully detailed laboratory analysis certifications covering chemical composition and stress testing parameters.</p>
            </div>
            
            <div className="why-card group">
              <div className="why-icon">
                <Truck className="w-10 h-10 text-[#C0C0C0] transition-transform duration-300 group-hover:translate-x-2" />
              </div>
              <h4>READY STOCK — CHENNAI</h4>
              <p>Extensive inventories stored right on the Vanagaram-Ambattur road. Guaranteeing speedy pan-India supply dispatch schedules.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: CONTACT / FORM / INTEGRATED FOOTER */}
      <section id="contact" className="contact-section py-24 bg-[#060606] border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="section-eyebrow">GET IN TOUCH</p>
          <h2>REQUEST A QUOTE</h2>
          <p className="contact-sub max-w-xl mx-auto text-gray-500">
            Tell us your desired steel grade, dimensional profiles, and tonnage requirements — our sales desk will reply with a detailed proposal within 24 hours.
          </p>

          {/* Contact Details Grid */}
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-label">MOBILE DESK</span>
              <a href={`tel:${MOBILE.replace(/\s+/g, '')}`} className="contact-value font-mono hover:text-[#7B52AB]">
                +91 {MOBILE}
              </a>
              <span className="text-[10px] text-gray-500 font-mono">Mon - Sat: 9:00 AM - 7:00 PM</span>
            </div>

            <div className="contact-item">
              <span className="contact-label">EMAIL DESK</span>
              <a href={`mailto:${EMAIL}`} className="contact-value font-mono hover:text-[#7B52AB]">
                {EMAIL}
              </a>
              <span className="text-[10px] text-gray-500 font-mono">Primary procurement mailbox</span>
            </div>

            <div className="contact-item">
              <span className="contact-label">HEADQUARTERS</span>
              <span className="contact-value text-sm">
                Plot No. 8, Survey No. 34/1,<br/>
                Vanagaram – Ambattur Road,<br/>
                Ayanambakkam, Chennai – 600 095
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Tamil Nadu, India</span>
            </div>
          </div>

          {/* Interactive Quick Form */}
          <div className="max-w-xl mx-auto bg-[#0d0d0d] p-8 rounded-lg border border-[#1a1a1a] text-left mb-12 shadow-2xl">
            <h4 className="text-lg font-bold font-display uppercase tracking-wider mb-4 text-[#C0C0C0] border-b border-[#222] pb-2">
              Quick Callback Form
            </h4>
            
            {quickContactSubmitted ? (
              <div className="py-8 text-center">
                <Check className="w-12 h-12 text-[#F5C800] mx-auto mb-3" />
                <h5 className="font-mono text-sm uppercase text-[#F5C800]">Message Logged Successfully</h5>
                <p className="text-xs text-gray-500 mt-1">Our sales engineering team will call you back shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleQuickSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.g., Procurement Head" 
                      className="calc-input"
                      value={quickForm.name}
                      onChange={(e) => setQuickForm({...quickForm, name: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Contact Mobile</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="10 digit mobile" 
                      className="calc-input"
                      value={quickForm.phone}
                      onChange={(e) => setQuickForm({...quickForm, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Requirement Note</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Provide profile size, steel grades, and estimated monthly tonnage..." 
                    className="calc-input py-2.5 resize-none"
                    value={quickForm.message}
                    onChange={(e) => setQuickForm({...quickForm, message: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-[#7B52AB] hover:bg-[#7B52AB]/90 text-white font-mono text-xs uppercase tracking-widest transition-colors font-bold">
                  Submit Requirement
                </button>
              </form>
            )}
          </div>

          <div className="cta-buttons">
            <a href={`tel:${MOBILE.replace(/\s+/g, '')}`} className="px-6 py-3.5 bg-[#7B52AB] text-white text-xs font-mono uppercase tracking-widest hover:brightness-110 flex items-center gap-2">
              <Phone size={14} /> Call Office &gt;
            </a>
            <a href={`mailto:${EMAIL}`} className="px-6 py-3.5 bg-zinc-900 border border-[#222] text-white text-xs font-mono uppercase tracking-widest hover:border-white flex items-center gap-2">
              <Mail size={14} /> Email Draft &gt;
            </a>
          </div>
        </div>
      </section>

      {/* SITE FOOTER */}
      <footer className="site-footer">
        <div className="footer-left">
          <span className="footer-logo">METFIN STEEL</span>
          <span className="footer-sub">Mfrs. Bright Steel Bars</span>
        </div>
        
        <div className="footer-center">
          <span className="footer-gstin">GSTIN: {GSTIN} <span className="text-gray-700 mx-2">|</span> Chennai Office</span>
        </div>
        
        <div className="footer-right text-right">
          <p className="text-[10px] text-gray-600 font-mono tracking-wider">
            © 2025 METFIN INDIA STEEL. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[9px] text-gray-700 font-mono mt-1">
            Mfrs. Cold Drawn, Turned & Polished Steel Rods & Bars
          </p>
        </div>
      </footer>

      {/* WHOLESALE QUOTE POPUP MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setModalOpen(false); setModalSuccess(false); }} className="modal-close" aria-label="Close modal">
              <X size={20} />
            </button>
            
            {modalSuccess ? (
              <div className="submit-success py-6 text-center">
                <div className="success-icon animate-bounce text-[#F5C800] text-4xl mb-4">✓</div>
                <h3 className="modal-title text-white uppercase">Quote Logged</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                  Thank you. We have recorded your parameters for <strong>{quoteForm.shape.toUpperCase()} Bright Bars</strong>. 
                  We will issue a formal proforma commercial invoice quotation shortly.
                </p>
                <button 
                  onClick={() => { setModalOpen(false); setModalSuccess(false); }} 
                  className="mt-6 px-6 py-2.5 bg-[#7B52AB] text-white font-mono text-xs uppercase tracking-widest"
                >
                  Return to Site
                </button>
              </div>
            ) : (
              <div>
                <h3 className="modal-title font-display uppercase tracking-wide text-white">Request Official Quote</h3>
                <p className="modal-desc text-gray-500">Provide wholesale parameters and our partner {PARTNER} will issue a formal quote.</p>
                
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Contact Name</label>
                      <input 
                        type="text" 
                        required 
                        className="calc-input"
                        value={quoteForm.name}
                        onChange={(e) => setQuoteForm({...quoteForm, name: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Company Name</label>
                      <input 
                        type="text" 
                        required 
                        className="calc-input"
                        value={quoteForm.company}
                        onChange={(e) => setQuoteForm({...quoteForm, company: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Procurement Email</label>
                      <input 
                        type="email" 
                        required 
                        className="calc-input"
                        value={quoteForm.email}
                        onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Mobile Number</label>
                      <input 
                        type="tel" 
                        required 
                        className="calc-input"
                        value={quoteForm.phone}
                        onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Shape</label>
                      <select 
                        className="calc-select"
                        value={quoteForm.shape}
                        onChange={(e) => setQuoteForm({...quoteForm, shape: e.target.value})}
                      >
                        <option value="round" className="bg-[#0d0d0d]">Round</option>
                        <option value="square" className="bg-[#0d0d0d]">Square</option>
                        <option value="hex" className="bg-[#0d0d0d]">Hex</option>
                        <option value="flat" className="bg-[#0d0d0d]">Flat</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Dimensions (mm)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="E.g. 25mm"
                        className="calc-input"
                        value={quoteForm.size}
                        onChange={(e) => setQuoteForm({...quoteForm, size: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Total Bars / Tons</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="E.g. 500 Bars"
                        className="calc-input"
                        value={quoteForm.quantity}
                        onChange={(e) => setQuoteForm({...quoteForm, quantity: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Steel Grade Class</label>
                    <select 
                      className="calc-select"
                      value={quoteForm.grade}
                      onChange={(e) => setQuoteForm({...quoteForm, grade: e.target.value})}
                    >
                      {STEEL_GRADES.map(g => (
                        <option key={g.name} value={g.name} className="bg-[#0d0d0d]">{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Additional Requirements / Notes</label>
                    <textarea 
                      rows={2}
                      className="calc-input resize-none"
                      placeholder="Specify tolerance range (e.g. h9), custom lengths, or packing specifications..."
                      value={quoteForm.message}
                      onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                    />
                  </div>

                  <button type="submit" className="btn-submit uppercase tracking-widest font-bold mt-4">
                    Send Quote Request
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
