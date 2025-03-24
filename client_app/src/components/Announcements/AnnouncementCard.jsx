import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

function AnnouncementCard({
  view,
  title,
  date,
  description,
  status,
  image,
  creatorRole,
  onView,
  onEdit,
  onDelete,
  readonly
}) {
  const roleLabels = {
    'ojt-coordinator': 'Coordinator',
    'hte-supervisor': 'HTE Supervisor',
    'dean': 'Dean'
  };

  return (
    <Card className={`
      overflow-hidden transition-shadow hover:shadow-lg 
      ${view === "list" ? "flex flex-col sm:flex-row" : ""}
    `}>
      {image && (
        <div className={`
          ${view === "list" ? "w-full sm:w-48 h-48 flex-shrink-0" : "w-full h-48"}
          relative overflow-hidden
        `}>
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
  
      <div className="flex-1 flex flex-col w-full ">
        <CardHeader className="space-y-2">
          <div className="flex flex-row items-center gap-2">
            <Badge 
              variant={
                status === "New" ? "default" :
                status === "Urgent" ? "destructive" :
                "secondary"
              }
              className="w-fit mb-2"
            >
              {status}
            </Badge>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
          </div>
          <div className="flex flex-col sm:flex-col justify-between items-start sm:items-left gap-1">
            <p className="text-sm text-gray-500 leading-tight gap-1">
              {format(new Date(date), 'PPP')}
            </p>
            <p className="text-sm text-gray-500">
              Posted by: {roleLabels[creatorRole] || creatorRole}
            </p>
          </div>
        </CardHeader>
  
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-2 leading-tight">
            {description}
          </p>
        </CardContent>

        <CardFooter className="flex flex-wrap justify-end gap-2 mt-auto">
          <Button variant="outline" size="sm" onClick={onView} className="w-full sm:w-auto">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {
            !readonly && (
              <>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit} className="w-full sm:w-auto">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </>
            )
          }


        </CardFooter>
      </div>
    </Card>
  );
}

export default AnnouncementCard; 