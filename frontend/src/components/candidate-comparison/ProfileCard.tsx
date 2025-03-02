import React from 'react';
import { CheckCircle, Award } from 'lucide-react';
import { ProfileCardProps } from './types';

/**
 * ProfileCard component displays a candidate's profile information
 */
const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isWinner, side }) => {
  console.log("PROFILE: ", profile)
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
              <div className="flex items-start mb-1">
                {exp.companyLogo && (
                  <img 
                    src={exp.companyLogo} 
                    alt={exp.company} 
                    className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0" 
                  />
                )}
                <div>
                  <div className="font-medium">{exp.role}</div>
                  <div className="text-sm text-gray-600">{exp.company}</div>
                  <div className="text-xs text-gray-500">
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
              </div>
              
              {exp.descriptionBullets?.length > 0 && (
                <details className="cursor-pointer mt-1">
                  <summary className="text-gray-700 hover:text-gray-900 text-sm">
                    {exp.descriptionBullets[0].substring(0, 80)}
                    {exp.descriptionBullets[0].length > 80 && "..."}
                    {exp.descriptionBullets.length > 1 && " (+ more)"}
                  </summary>
                  <ul className="list-disc pl-4 mt-1 text-sm">
                    {exp.descriptionBullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </details>
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