/**
 * Test component to verify ChatHeader handles undefined/null values correctly
 */
import React from 'react';
import ChatHeader from '../src/components/chat/ChatHeader';

// Test cases for different scenarios
const testCases = [
  {
    name: 'With mentor data',
    props: {
      mentor: {
        id: '1',
        name: 'John Doe',
        avatar: '/avatar.jpg',
        isOnline: true,
        roleTitle: 'Senior Mentor'
      }
    }
  },
  {
    name: 'With roomName only',
    props: {
      roomName: 'Test Room',
      isOnline: false
    }
  },
  {
    name: 'With undefined mentor name (should not crash)',
    props: {
      mentor: {
        id: '2',
        name: undefined, // This should be handled gracefully
        avatar: null,
        isOnline: false
      }
    }
  },
  {
    name: 'With empty string name (should not crash)',
    props: {
      mentor: {
        id: '3',
        name: '', // This should be handled gracefully
        avatar: null,
        isOnline: true
      }
    }
  },
  {
    name: 'With no name data at all (should not crash)',
    props: {
      // No mentor, no roomName - should show "Unknown"
      isOnline: false
    }
  }
];

export default function ChatHeaderTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">ChatHeader Test Cases</h1>
      <div className="space-y-6">
        {testCases.map((testCase, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">{testCase.name}</h2>
            <div className="bg-gray-100 p-2 rounded mb-2">
              <code className="text-sm">
                {JSON.stringify(testCase.props, null, 2)}
              </code>
            </div>
            <div className="border border-gray-300 rounded">
              <ChatHeader {...testCase.props as any} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <h2 className="font-semibold mb-2 text-green-800">✅ Fixed Issues:</h2>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Handles undefined/null mentor.name gracefully</li>
          <li>• Handles empty string names without crashing</li>
          <li>• Provides fallback "Unknown" when no name is available</li>
          <li>• Uses "?" as avatar letter when name is empty/undefined</li>
          <li>• Supports both legacy roomName prop and new mentor prop</li>
        </ul>
      </div>
    </div>
  );
}
