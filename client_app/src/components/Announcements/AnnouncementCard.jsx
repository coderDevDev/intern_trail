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
      ${view === "list" ? "flex flex-col sm:flex-row items-stretch sm:items-center" : ""}
    `}>
      {image && (
        <div className={`
          ${view === "list" ? "w-full sm:w-48 h-48" : "w-full h-48"}
          relative overflow-hidden
        `}>
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <div className="flex-1">
        <CardHeader className="space-y-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            <Badge variant={
              status === "New" ? "default" :
                status === "Urgent" ? "destructive" :
                  "secondary"
            }>
              {status}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-sm text-gray-500">
              {format(new Date(date), 'PPP')}
            </p>
            <span className="text-sm text-gray-500">
              Posted by: {roleLabels[creatorRole] || creatorRole}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        </CardContent>

        <CardFooter className="flex flex-wrap justify-end gap-2">
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