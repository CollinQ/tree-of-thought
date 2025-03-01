import React from 'react';
import { CheckCircle, Award } from 'lucide-react';
import { ProfileCardProps } from './types';

/**
 * ProfileCard component displays a candidate's profile information
 */
const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isWinner, side }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 relative ${
        isWinner ? 'ring-4 ring-green-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{profile.name}</h3>
            <div className="flex items-center">
              <span className="text-gray-600">Elo: {profile.elo}</span>
              <span className={`ml-2 ${profile.eloChange.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                ({profile.eloChange})
              </span>
            </div>
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
          {profile.experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-blue-500 pl-3">
              <div className="font-medium">{exp.title}</div>
              <div className="text-sm text-gray-600">{exp.organization}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">Education</h4>
        <div className="space-y-3">
          {profile.education.map((edu, index) => (
            <div key={index} className="border-l-2 border-purple-500 pl-3">
              <div className="font-medium">{edu.institution}</div>
              <div className="text-sm text-gray-600">{edu.degree}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Honors</h4>
        <div className="space-y-2">
          {profile.honors.map((honor, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="w-4 h-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <span className="text-sm">{honor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard; 