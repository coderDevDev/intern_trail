import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from 'date-fns';

function FeedbackList({ feedback }) {
  if (!feedback || feedback.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No feedback available for this company yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <div key={item.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={item.avatar} alt={`${item.first_name} ${item.last_name}`} />
              <AvatarFallback>{item.first_name?.charAt(0)}{item.last_name?.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{item.first_name} {item.last_name}</h4>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-xs text-gray-500">
                      {format(new Date(item.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {item.comment && (
                <p className="mt-2 text-gray-700">{item.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeedbackList; 