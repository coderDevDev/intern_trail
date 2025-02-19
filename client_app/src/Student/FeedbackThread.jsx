import React, { useState } from 'react';
import { Button } from '@/components/ui/button'
// import { Emoji } from 'emoji-mart';
// import 'emoji-mart/css/emoji-mart.css';

function FeedbackThread({ reportId, feedback, addFeedback, addReply }) {
  const [newFeedback, setNewFeedback] = useState('');

  const handleAddFeedback = () => {
    if (newFeedback.trim()) {
      addFeedback(newFeedback);
      setNewFeedback('');
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h2 className="text-xl font-semibold mb-4">Feedback for {reportId}</h2>
      <div className="space-y-4">
        {feedback.map((fb, fbIndex) => (
          <div key={fbIndex} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">
                {fb.role === 'AI' ? 'AI Assistant' :
                  `${fb.first_name} ${fb.middle_initial || ''} ${fb.last_name}`}
              </div>
              <div className="text-sm text-gray-500">
                {fb.formatted_date}
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{fb.feedback}</p>
            <div className="flex space-x-2 mt-2">
              {/* <Emoji emoji="thumbsup" size={16} />
              <Emoji emoji="heart" size={16} /> */}
            </div>
            <Button className="mt-2 text-blue-500 hover:underline" onClick={() => addReply(fbIndex, 'Reply text')}>
              Reply
            </Button>
            {/* Nested replies */}
            <div className="ml-4 mt-2 space-y-2">
              {fb.replies.map((reply, replyIndex) => (
                <div key={replyIndex} className="text-sm text-gray-600 dark:text-gray-400">
                  {reply.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <input
          type="text"
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <Button onClick={handleAddFeedback} className="mt-2 bg-blue-500 text-white rounded-full px-4 py-2">
          Submit
        </Button>
      </div>
    </div>
  );
}

export default FeedbackThread;