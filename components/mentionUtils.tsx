import React from 'react';
import { User } from '../types';

/**
 * Checks if a specific user is mentioned in the text.
 * Uses word boundaries to ensure accurate matching (e.g., matches "@Rob" but not "@Robert").
 */
export const isUserMentioned = (text: string, user: User): boolean => {
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
export const renderTextWithMentions = (text: string, users: User[]): React.ReactNode[] => {
  // Split by specific regex to capture the delimiters
  // We want to split by (@[\w\s]+) but that's too greedy with spaces.
  // The original logic in StandupFeedModal was specific to the UI rendering needs.
  // Let's refine it to be robust:
  // We will split by spaces to process words, or use a careful regex.
  // Given names have spaces, the "split by space" approach in the previous turn was abandoned 
  // for the `split(/(@[\w\s]+)/g)` approach which worked but needed refinement for "John Doe".
  
  // Let's stick to the implementation that was working in StandupFeedModal:
  // It splits by `(@[\w\s]+)` which is greedy.
  
  const parts = text.split(/(@[\w\s]+)/g);
  return parts.map((part, index) => {
     if (part.startsWith('@')) {
        const sortedUsers = [...users].sort((a, b) => b.name.length - a.name.length);
        const matchedUser = sortedUsers.find(u => part.startsWith(`@${u.name}`) || part.startsWith(`@${u.name.split(' ')[0]}`));
        
        if (matchedUser) {
           const matchName = part.startsWith(`@${matchedUser.name}`) ? matchedUser.name : matchedUser.name.split(' ')[0];
           const suffix = part.substring(matchName.length + 1);
           return (
             <React.Fragment key={index}>
               <span className="text-indigo-600 font-semibold bg-indigo-50 px-1 rounded">@{matchName}</span>
               {suffix}
             </React.Fragment>
           );
        }
     }
     return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};
