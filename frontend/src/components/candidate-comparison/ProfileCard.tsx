import React, { useState } from 'react';
import { CheckCircle, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileCardProps } from './types';

/**
 * ProfileCard component displays a candidate's profile information
 */
const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isWinner, side }) => {
  // Add state to track which experience items are expanded
  const [expandedExperience, setExpandedExperience] = useState<number | null>(null);
  
  // Toggle function for experience expansion
  const toggleExperience = (index: number) => {
    setExpandedExperience(expandedExperience === index ? null : index);
  };
  
  console.log("PROFILE: ", profile);
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 relative ${
        isWinner ? 'ring-4 ring-green-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{profile.name}</h3>
          </div>
        </div>
        {isWinner && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center">
            <Award className="w-4 h-4 mr-1" />
            Winner
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">Experience</h4>
        <div className="space-y-3">
          {profile.workExperience.map((exp, index) => (
            <div key={index} className="border-l-2 border-blue-500 pl-3">
              {/* Make entire experience block clickable */}
              <div 
                className="cursor-pointer" 
                onClick={() => toggleExperience(index)}
              >
                {/* Make the entire row a flex container with arrow on right */}
                <div className="flex items-center justify-between mb-1">
                  {/* Left side with logo and details */}
                  <div className="flex items-start">
                    <img 
                      src={exp.companyLogo || ''} 
                      alt="" 
                      className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0" 
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                    <div>
                      <div className="font-medium">{exp.role}</div>
                      <div className="text-sm text-gray-600">{exp.company}</div>
                      <div className="text-xs text-gray-500">
                        {exp.startDate} - {exp.endDate}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side with arrow */}
                  {exp.descriptionBullets?.length > 0 && (
                    <span className="flex-shrink-0 self-center">
                      {expandedExperience === index ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Animated description bullets */}
              {exp.descriptionBullets?.length > 0 && (
                <AnimatePresence>
                  {expandedExperience === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <ul className="list-disc pl-4 mt-1 text-sm">
                        {exp.descriptionBullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">Education</h4>
        <div className="space-y-3">
          {profile.education.map((edu, index) => (
            <div key={index} className="border-l-2 border-purple-500 pl-3">
              <div className="font-medium">{edu.school}</div>
              <div className="text-sm text-gray-600">{edu.degree}, {edu.major}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard; 