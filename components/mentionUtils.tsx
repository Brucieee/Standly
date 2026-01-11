import React from 'react';
import { User } from '../types';

/**
 * Checks if a specific user is mentioned in the text.
 * Uses word boundaries to ensure accurate matching (e.g., matches "@Rob" but not "@Robert").
 * Also returns true if "@everyone" is mentioned.
 */
export const isUserMentioned = (text: string, user: User): boolean => {
  // Check for @everyone first
  if (/@everyone\b/i.test(text)) return true;

  const name = user.name;
  const firstName = name.split(' ')[0];
  
  // Escape special regex characters
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\\]/g, '\\$&');
  
  const namePattern = new RegExp(`@${escapeRegExp(name)}\\b`, 'i');
  const firstNamePattern = new RegExp(`@${escapeRegExp(firstName)}\\b`, 'i');
  
  return namePattern.test(text) || firstNamePattern.test(text);
};

/**
 * Renders text with user mentions highlighted.
 * Scans for @Name patterns and matches them against the provided users list.
 */
export const renderTextWithMentions = (text: string, users: User[]): (string | React.ReactNode)[] => {
  // Split by specific regex to capture the delimiters
  const parts = text.split(/(@[\w\s]+)/g);
  return parts.map((part, index) => {
     if (part.startsWith('@')) {
        // Check for @everyone
        if (/^@everyone\b/i.test(part)) {
           const suffix = part.substring(9); // "@everyone".length
           return (
             <React.Fragment key={index}>
               <span className="text-amber-600 font-bold bg-amber-50 px-1 rounded border border-amber-100">@everyone</span>
               {suffix}
             </React.Fragment>
           );
        }

        const sortedUsers = [...users].sort((a, b) => b.name.length - a.name.length);
        const matchedUser = sortedUsers.find(u => part.startsWith(`@${u.name}`) || part.startsWith(`@${u.name.split(' ')[0]}`));
        
        if (matchedUser) {
           const matchName = part.startsWith(`@${matchedUser.name}`) ? matchedUser.name : matchedUser.name.split(' ')[0];
           const suffix = part.substring(matchName.length + 1);
           return (
             <React.Fragment key={index}>
               <span className="text-purple-600 font-semibold bg-purple-50 px-1 rounded border border-purple-100">@{matchName}</span>
               {suffix}
             </React.Fragment>
           );
        }
     }
     // Return plain string for non-matching parts
     return part;
  });
};
