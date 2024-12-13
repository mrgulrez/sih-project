import { useState } from 'react';
import PropTypes from 'prop-types';
import { EyeIcon, UserCircleIcon, SparklesIcon, ImageIcon } from 'lucide-react';

// Import images (Make sure to replace these with your actual image paths)
import img1 from '../assets/ALL.jpeg';
import img2 from '../assets/Gul_Insha_Fir.jpeg';
import img3 from '../assets/Insha_Fir.jpeg';
import img4 from '../assets/Man_Fai.jpeg';
import profile1 from '../assets/Insha.jpeg';
import profile2 from '../assets/Gul.jpeg';
import profile3 from '../assets/Man.jpeg';
import profile4 from '../assets/faizan.jpeg';
import profile5 from '../assets/Firdaus.jpeg';
import profile6 from '../assets/Name.jpeg';

// Team Member Modal Component
const TeamMemberModal = ({ member, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
      >
        ✕
      </button>
      <div className="flex flex-col items-center">
        <img
          src={member.image}
          alt={member.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 mb-4"
        />
        <h2 className="text-2xl font-bold text-blue-900">{member.name}</h2>
        <p className="text-blue-700 mb-4">{member.role}</p>
        <p className="text-gray-600 text-center">
          A dedicated team member bringing passion and expertise to our team.
        </p>
      </div>
    </div>
  </div>
);

TeamMemberModal.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

// Gallery Image Modal Component
const GalleryImageModal = ({ src, alt, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
    <div className="relative max-w-4xl w-full">
      <button
        onClick={onClose}
        className="absolute -top-8 right-0 text-white hover:text-gray-300 transition-colors"
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-lg shadow-2xl object-contain max-h-[90vh]"
      />
    </div>
  </div>
);

GalleryImageModal.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

// Main About Component
const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryItems = [
    { src: img1, alt: 'Team Collaboration' },
    { src: img2, alt: 'Team Workshop' },
    { src: img3, alt: 'Project Planning' },
    { src: img4, alt: 'Team Building' },
  ];

  const teamMembers = [
    { name: 'Insharah Ayyubi', role: 'Team Leader', image: profile1 },
    { name: 'Gulrez Alam', role: 'Developer', image: profile2 },
    { name: 'Mantasha Firdous', role: 'Developer', image: profile3 },
    { name: 'Faizan Ansari', role: 'Developer', image: profile4 },
    { name: 'Firdaus Fatima', role: 'Developer', image: profile5 },
    { name: 'Nameera Jabi', role: 'Developer', image: profile6 },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      {/* Header Section */}
      <header className="bg-blue-900 text-white py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-4 flex items-center justify-center gap-3">
          <SparklesIcon className="text-yellow-400" />
          Our Team & Journey SIH-2024
          <SparklesIcon className="text-yellow-400" />
        </h1>
        <p className="text-xl text-blue-200 max-w-2xl mx-auto">
          Discover the passionate individuals behind our innovative solutions
        </p>
      </header>
<section className="container mx-auto px-6 py-12">
  <div className="flex items-center mb-8">
    <ImageIcon className="mr-3 text-blue-700" />
    <h2 className="text-3xl font-bold text-blue-900">Our Gallery</h2>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    {galleryItems.map((item, index) => (
      <div
        key={index}
        className="overflow-hidden rounded-lg shadow-lg group cursor-pointer relative"
        onClick={() => setSelectedImage(item)}
      >
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <EyeIcon className="text-white opacity-0 group-hover:opacity-100 w-12 h-12" />
        </div>
      </div>
    ))}
  </div>
</section>


      {/* Team Section */}
      <section className="container mx-auto px-6 py-12 bg-white rounded-xl shadow-lg">
        <div className="flex items-center mb-8">
          <UserCircleIcon className="mr-3 text-blue-700" />
          <h2 className="text-3xl font-bold text-blue-900">Meet Our Team</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="text-center group cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="relative inline-block">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-28 h-28 mx-auto rounded-full shadow-lg object-cover \
                    transition-all duration-300 \
                    group-hover:scale-110 \
                    group-hover:shadow-2xl \
                    border-4 border-transparent group-hover:border-blue-500"
                />
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"></div>
              </div>
              <h3 className="text-lg font-semibold mt-4 text-blue-900">{member.name}</h3>
              <p className="text-blue-600">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      {selectedMember && (
        <TeamMemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {selectedImage && (
        <GalleryImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default About;
