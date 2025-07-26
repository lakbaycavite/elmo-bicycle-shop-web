import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { CircleArrowRight } from 'lucide-react';

function Products() {
  const navigate = useNavigate()

  const images = [
    '/images/bike-pd-1.jpg',
    '/images/bike-pd-1.jpg',
    '/images/bike-pd-1.jpg',
    '/images/bike-pd-1.jpg',
    '/images/bike-pd-1.jpg',
    '/images/bike-pd-1.jpg',
    '/images/bike-pd-1.jpg',
  ]

  const sectionTitles = [
    "Shimano Racing Gears",
    "Premium Carbon Frames",
    "High-Performance Wheels",
    "Professional Cycling Gear",
    "Ergonomic Handlebars",
    "Advanced Suspension Systems"
  ]

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

  return (
    <div className="h-full bg-[#181818] text-white">
      <Navbar isLoggedIn={true} userType="customer" />
      
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
        
        {/* Product Slider */}
        <div className='w-full px-2 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 mt-8'>
          <Slider {...sliderSettings}>
            {images.map((image, index) => (
              <div key={index} className='px-3 sm:px-3 lg:px-4 outline-none'>
                <div className='relative h-72 rounded-xl overflow-hidden group transform transition-transform duration-700 hover:scale-105 hover:z-10'>
                  <div className='absolute inset-0 rounded-xl shadow-lg shadow-black/50 transform transition-transform duration-700 group-hover:rotate-y-12 group-hover:translate-z-20'>
                    <img 
                      src={image} 
                      alt={`Bike ${index + 1}`}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <button 
                        className='px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors'
                        onClick={() => navigate(`/product/${index + 1}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

          {/* Accessories Section */}
        <div className='flex flex-col items-center justify-center h-full py-12  bg-gray-800'>
             <h1><span className="text-3xl font-bold text-orange-500 mb-2">Accessories</span></h1>
              <div className='flex flex-row  gap-20 max-w-[90%] mt-8 h-[50%]  items-center'>
                  {/* Left Description */}
                  <div className=" bg-gray-900 rounded-xl p-6 shadow-lg w-[50%] h-[500px] ">
                    <div className="mb-6">
                      <h1 className='text-2xl font-bold text-orange-500 mb-3'> 
                        <span className='text-orange-500'>Ride with Confidence!</span>
                      </h1>
                      <p className='text-gray-300 text-sm md:text-base'> 
                        Discover premium bikes, gear, and expert services at Elmo Bicycle Shop. 
                        We're committed to quality, transparency, and your cycling journey.
                      </p>
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'> 
                      <div className='bg-gray-700 p-3 rounded-lg'>
                        <h2 className='text-base font-bold text-orange-400 mb-1 text-[15px]'> 
                          Quality Guaranteed
                        </h2>
                        <p className='text-gray-300 text-xs md:text-sm'> 
                          Your satisfaction is our priority with 100% quality promise.
                        </p>
                      </div>
                      <div className='bg-gray-700 p-3 rounded-lg'>
                        <h2 className='text-base font-bold text-orange-400 mb-1 text-[15px]'>
                          Expert Advice
                        </h2>
                        <p className='text-gray-300 text-xs md:text-sm'>
                          Get personalized recommendations from our specialists.
                        </p>
                      </div>
                      <div className='bg-gray-700 p-3 rounded-lg'>
                        <h2 className='text-base font-bold text-orange-400 mb-1 text-[15px]'>
                          Trusted Service
                        </h2>
                        <p className='text-gray-300 text-xs md:text-sm'>
                          Certified mechanics for tune-ups and custom builds.
                        </p>
                      </div>
                      <div className='bg-gray-700 p-3 rounded-lg'>
                        <h2 className='text-base font-bold text-orange-400 mb-1 text-[15px]'>
                          Always Here
                        </h2>
                        <p className='text-gray-300 text-xs md:text-sm'>
                          Assistance online, by phone, or in-store.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/*Right Side*/}
                  <div className='w-[50%] flex items-center justify-center flex-col rounded-2xl p-4 bg-gray-900'>
                    <h1><span className='text-orange-500'>Featured Accessory!</span></h1>
                     <img
                        src="/images/bikehelmet1.png"
                        alt="Elmo Bicycle Shop Accessories"
                        className="w-[300px] h-[300px] object-contain rounded-xl mt-4 "
                      />
                      <p className='bg-gray-700 p-3 rounded-lg'>Our certified mechanics provide precision tune-ups and repairs using top-tier tools and genuine parts, 
                        ensuring your bike performs at its peak. Every service comes with a 100% satisfaction guarantee—because your ride should be flawless.
                        From beginners to pros, we listen to your needs and offer tailored advice—no pushy sales, just honest recommendations. 
                        Plus, our after-purchase support ensures you’re never left stranded.</p>
                       <button 
                        className='mt-8 px-8 py-3 bg-orange-500 text-white rounded-2l font-semibold hover:bg-orange-600 transition-colors shadow-lg w-auto flex gap-3'
                        onClick={() => navigate('/customer/accessories-category')}
                      >
                        View All Accessories  <CircleArrowRight />

                      </button>
                  </div>
              </div>
        </div>

         {/* Accessories Section */}
        <div className='flex flex-col items-center justify-center h-full py-12  '>
             <h1><span className="text-3xl font-bold text-orange-500 mb-2">Gears and Parts</span></h1>
              <div className='flex flex-row  gap-20 max-w-[90%] mt-8 h-[50%]  items-center'>
                  {/*Left Side*/}
                  <div className='w-[50%] flex items-center justify-center flex-col rounded-2xl p-4 bg-gray-900'>
                    <h1><span className='text-orange-500'>Featured Gear!</span></h1>
                     <img
                        src="/images/bikehelmet1.png"
                        alt="Elmo Bicycle Shop Accessories"
                        className="w-[300px] h-[300px] object-contain rounded-xl mt-4 "
                      />
                      <p className='bg-gray-700 p-3 rounded-lg'>Our certified mechanics provide precision tune-ups and repairs using top-tier tools and genuine parts, 
                        ensuring your bike performs at its peak. Every service comes with a 100% satisfaction guarantee—because your ride should be flawless.
                        From beginners to pros, we listen to your needs and offer tailored advice—no pushy sales, just honest recommendations. 
                        Plus, our after-purchase support ensures you’re never left stranded.</p>
                       <button 
                        className='mt-8 px-8 py-3 bg-orange-500 text-white rounded-2l font-semibold hover:bg-orange-600 transition-colors shadow-lg w-auto flex gap-3'
                        onClick={() => navigate('/customer/gears-category')}
                      >
                        View All Gears and Parts  <CircleArrowRight />

                      </button>
                  </div>
                   {/* Right Description */}
                  <div className=" bg-gray-900 rounded-xl p-6 shadow-lg w-[50%] h-[500px] ">
                    <div className="mb-6">
                      <h1 className='text-2xl font-bold text-orange-500 mb-3'> 
                        <span className='text-orange-500'>Ride with Confidence!</span>
                      </h1>
                      <p className='text-gray-300 text-sm md:text-base'> 
                        Discover premium bikes, gear, and expert services at Elmo Bicycle Shop. 
                        We're committed to quality, transparency, and your cycling journey.
                      </p>
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'> 
                      <div className='bg-gray-700 p-3 rounded-lg'>
                        <h2 className='text-base font-bold text-orange-400 mb-1 text-[15px]'> 
                          Quality Guaranteed
                        </h2>
                        <p className='text-gray-300 text-xs md:text-sm'> 
                          Your satisfaction is our priority with 100% quality promise.
                        </p>
                      </div>
                      <div className='bg-gray-700 p-3 rounded-lg'>
                        <h2 className='text-base font-bold text-orange-400 mb-1 text-[15px]'>
                          Expert Advice
                        </h2>
                        <p className='text-gray-300 text-xs md:text-sm'>
                          Get personalized recommendations from our specialists.
                        </p>
                      </div>
                      <div className='bg-gray-700 p-3 rounded-lg'>
                        <h2 className='text-base font-bold text-orange-400 mb-1 text-[15px]'>
                          Trusted Service
                        </h2>
                        <p className='text-gray-300 text-xs md:text-sm'>
                          Certified mechanics for tune-ups and custom builds.
                        </p>
                      </div>
                      <div className='bg-gray-700 p-3 rounded-lg'>
                        <h2 className='text-base font-bold text-orange-400 mb-1 text-[15px]'>
                          Always Here
                        </h2>
                        <p className='text-gray-300 text-xs md:text-sm'>
                          Assistance online, by phone, or in-store.
                        </p>
                      </div>
                    </div>
                  </div>
              </div>
        </div>

      {/* Custom CSS for the title carousel */}
      <style jsx>{`
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