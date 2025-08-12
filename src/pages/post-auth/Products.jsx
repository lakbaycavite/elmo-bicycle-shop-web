import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CircleArrowRight, Heart } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { useEffect, useState } from 'react';

function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState({
    bikes: [],
    accessories: [],
    gearsParts: []
  });
  const [loading, setLoading] = useState(true);

  // Replace with your actual authentication logic
  const isLoggedIn = false

  const sectionTitles = [
    "Shimano Racing Gears",
    "Premium Carbon Frames",
    "High-Performance Wheels",
    "Professional Cycling Gear",
    "Ergonomic Handlebars",
    "Advanced Suspension Systems"
  ]

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = ref(database, 'products');
    
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Organize products by category
        const bikes = [];
        const accessories = [];
        const gearsParts = [];
        
        Object.values(data).forEach(product => {
          // Add random discount between 0-20% for demo purposes
          const productWithDiscount = {
            ...product,
            discount: Math.floor(Math.random() * 21) // 0-20% discount
          };
          
          if (product.category === 'bike') {
            bikes.push(productWithDiscount);
          } else if (product.category === 'accessory') {
            accessories.push(productWithDiscount);
          } else if (product.category === 'gear') {
            gearsParts.push(productWithDiscount);
          }
        });

        setProducts({
          bikes,
          accessories,
          gearsParts
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Settings for the product slider
  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    centerMode: false,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    responsive: [
      {
        breakpoint: 1536,
        settings: { slidesToShow: 4 }
      },
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 }
      }
    ]
  }

  // Settings for the title slider
  const titleSliderSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    pauseOnHover: false,
    centerMode: true,
    cssEase: 'linear',
    variableWidth: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 }
      }
    ]
  }

  if (loading) {
    return (
      <div className="h-full bg-[#181818] text-white flex items-center justify-center">
        <Navbar isLoggedIn={isLoggedIn} userType="customer" />
        <div className="text-2xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#181818] text-white">
      <Navbar isLoggedIn={isLoggedIn} userType="customer" />

      <div className='flex flex-col items-center justify-center h-full py-12'>
        {/* Hero Section */}
        <div className='relative w-screen -mx-[calc((100vw-100%)/2)] mb-5 shadow-lg shadow-black/50 rounded-2xl'>
          <div className='relative w-full h-[500px] overflow-hidden'>
            <div className='absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10'></div>
            <div className='absolute inset-0 bg-black/30 z-10'></div>
            <img
              src="/images/bike-bg.jpg"
              alt="Bike Shop Background"
              className='w-full h-full object-cover object-center'
            />
            <div className='absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4'>
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg'>
                Built for Speed, <span className='text-orange-400'>Designed for You!</span>
              </h1>
              <p className='text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl text-gray-100 drop-shadow-md'>
                Explore our wide range of premium bicycles and accessories for every adventure!
              </p>
              <button
                className='px-8 py-3 bg-orange-500 text-white rounded-3xl font-semibold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 transform hover:scale-105 flex gap-3'
                onClick={() => navigate('/customer/bikes-category')}
              >
                Discover Bikes!  <CircleArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Infinite Scrolling Title Carousel */}
        <div className='w-full max-w-8xl mb-8 overflow-hidden '>
          <Slider {...titleSliderSettings} className='title-carousel'>
            {sectionTitles.map((title, index) => (
              <div key={index} className='px-8 outline-none'>
                <h1 className='text-xl md:text-2xl font-bold whitespace-nowrap text-orange-400'>
                  {title}
                </h1>
              </div>
            ))}
          </Slider>
        </div>

        <label className='text-2xl md:text-3xl font-bold text-white mt-5'>
          <h1>Featured <span className='text-orange-400'>Bikes</span></h1>
        </label>

        {/* Bikes Slider */}
        <div className='w-full px-2 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 mt-8'>
          {products.bikes.length > 0 ? (
            <Slider {...sliderSettings}>
              {products.bikes.map((bike, index) => (
                <div key={index} className='px-3 sm:px-3 lg:px-4 outline-none'>
                  <div className='relative h-72 rounded-xl overflow-hidden group transform transition-transform duration-700 hover:scale-105 hover:z-10'>
                    {/* Discount badge */}
                    {bike.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                        {bike.discount}% OFF
                      </span>
                    )}
                    {/* Heart icon only if logged in */}
                    {isLoggedIn && (
                      <button className="absolute top-3 right-3 bg-white/80 rounded-full p-2 z-10">
                        <Heart className="text-orange-500" />
                      </button>
                    )}
                    <div className='absolute inset-0 rounded-xl shadow-lg shadow-black/50 transform transition-transform duration-700 group-hover:rotate-y-12 group-hover:translate-z-20'>
                      <img
                        src={bike.imageUrl || '/images/bike-pd-1.jpg'}
                        alt={bike.name || `Bike ${index + 1}`}
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <button
                          className='px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors'
                          onClick={() => navigate(`/product/${bike.id || index + 1}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <p className="text-center text-gray-400">No bikes available at the moment</p>
          )}
        </div>
      </div>

      {/* Accessories Section */}
      <div className='flex flex-col items-center justify-center h-full py-12 bg-gray-800'>
        <h1><span className="text-3xl font-bold text-orange-500 mb-2">Accessories</span></h1>
        <div className='w-full px-2 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 mt-8'>
          {products.accessories.length > 0 ? (
            <Slider {...sliderSettings}>
              {products.accessories.map((accessory, index) => (
                <div key={index} className='px-3 sm:px-3 lg:px-4 outline-none'>
                  <div className='relative h-72 rounded-xl overflow-hidden group transform transition-transform duration-700 hover:scale-105 hover:z-10'>
                    {/* Discount badge */}
                    {accessory.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                        {accessory.discount}% OFF
                      </span>
                    )}
                    {/* Heart icon only if logged in */}
                    {isLoggedIn && (
                      <button className="absolute top-3 right-3 bg-white/80 rounded-full p-2 z-10">
                        <Heart className="text-orange-500" />
                      </button>
                    )}
                    <div className='absolute inset-0 rounded-xl shadow-lg shadow-black/50 transform transition-transform duration-700 group-hover:rotate-y-12 group-hover:translate-z-20'>
                      <img
                        src={accessory.imageUrl || '/images/bikehelmet1.png'}
                        alt={accessory.name || `Accessory ${index + 1}`}
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <button
                          className='px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors'
                          onClick={() => navigate(`/accessory/${accessory.id || index + 1}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <p className="text-center text-gray-400">No accessories available at the moment</p>
          )}
        </div>
      </div>

      {/* Gears and Parts Section */}
      <div className='flex flex-col items-center justify-center h-full py-12'>
        <h1><span className="text-3xl font-bold text-orange-500 mb-2">Gears and Parts</span></h1>
        <div className='w-full px-2 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 mt-8'>
          {products.gearsParts.length > 0 ? (
            <Slider {...sliderSettings}>
              {products.gearsParts.map((gear, index) => (
                <div key={index} className='px-3 sm:px-3 lg:px-4 outline-none'>
                  <div className='relative h-72 rounded-xl overflow-hidden group transform transition-transform duration-700 hover:scale-105 hover:z-10'>
                    {/* Discount badge */}
                    {gear.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                        {gear.discount}% OFF
                      </span>
                    )}
                    {/* Heart icon only if logged in */}
                    {isLoggedIn && (
                      <button className="absolute top-3 right-3 bg-white/80 rounded-full p-2 z-10">
                        <Heart className="text-orange-500" />
                      </button>
                    )}
                    <div className='absolute inset-0 rounded-xl shadow-lg shadow-black/50 transform transition-transform duration-700 group-hover:rotate-y-12 group-hover:translate-z-20'>
                      <img
                        src={gear.imageUrl || '/images/bikehelmet1.png'}
                        alt={gear.name || `Gear ${index + 1}`}
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <button
                          className='px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors'
                          onClick={() => navigate(`/gear/${gear.id || index + 1}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <p className="text-center text-gray-400">No gears and parts available at the moment</p>
          )}
        </div>
      </div>

      {/* Custom CSS for the title carousel */}
      <style>{`
        .title-carousel .slick-track {
          display: flex;
          align-items: center;
        }
        .title-carousel .slick-slide {
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }
        .title-carousel .slick-center {
          opacity: 1;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}

export default Products