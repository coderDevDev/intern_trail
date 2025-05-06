import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'react-toastify';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';

const questions = [
  {
    question: "A. Quality of Work",
    choices: ["5", "4", "3", "2", "1"]
  },
  {
    question: "B. Quantity of Work",
    choices: ["5", "4", "3", "2", "1"]
  },
  {
    question: "C. Relation with Others",
    choices: ["5", "4", "3", "2", "1"]
  },
  {
    question: "D. Attitude Towards Work",
    choices: ["5", "4", "3", "2", "1"]
  },
  {
    question: "E. Dependability",
    choices: ["5", "4", "3", "2", "1"]
  },
  {
    question: "F. Ability to Learn",
    choices: ["5", "4", "3", "2", "1"]
  },
  {
    question: "G. Attendance",
    choices: ["5", "4", "3", "2", "1"]
  },
  {
    question: "H. Judgement",
    choices: ["5", "4", "3", "2", "1"]
  }
];

const ratingLabels = {
  "5": "Excellent",
  "4": "Above Average",
  "3": "Average",
  "2": "Below Average",
  "1": "Unreliable"
};

function EvaluationForm({ isOpen, onClose, student, existingData = null, initialFocus }) {
  const [answers, setAnswers] = useState(
    existingData?.answers ||
    questions.reduce((acc, _, index) => {
      acc[`question_${index}`] = "";
      return acc;
    }, {})
  );
  const [comments, setComments] = useState(existingData?.comments || "");
  const [loading, setLoading] = useState(false);
  const [viewOnly, setViewOnly] = useState(!!existingData);
  const [signatureData, setSignatureData] = useState(existingData?.signature || null);
  const signatureRef = useRef(null);
  const [overallRating, setOverallRating] = useState(existingData?.overallRating || "");

  useEffect(() => {
    if (existingData) {
      setAnswers(existingData.answers);
      setComments(existingData.comments);
      setSignatureData(existingData.signature);
      setOverallRating(existingData.overallRating);
    } else {
      resetForm();
    }
  }, [existingData, isOpen]);

  const resetForm = () => {
    setAnswers(
      questions.reduce((acc, _, index) => {
        acc[`question_${index}`] = "";
        return acc;
      }, {})
    );
    setComments("");
    setSignatureData(null);
    setOverallRating("");
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleRadioChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [`question_${questionIndex}`]: value
    }));
  };

  const handleCommentsChange = (e) => {
    setComments(e.target.value);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData(null);
    }
  };

  const saveSignature = () => {
    if (signatureRef.current) {
      const dataURL = signatureRef.current.toDataURL('image/png');
      setSignatureData(dataURL);
    }
  };

  const calculateAverageScore = () => {
    const numericAnswers = Object.values(answers).map(answer => parseInt(answer));
    const validAnswers = numericAnswers.filter(score => !isNaN(score));
    if (validAnswers.length === 0) return 0;

    const sum = validAnswers.reduce((acc, curr) => acc + curr, 0);
    return (sum / validAnswers.length).toFixed(2);
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    const unansweredQuestions = Object.values(answers).some(answer => !answer);
    if (unansweredQuestions) {
      toast.error("Please answer all questions");
      return;
    }

    // Validate signature
    if (!signatureData) {
      toast.error("Please provide your signature");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        studentId: student.userID,
        answers,
        comments,
        signature: signatureData,
        evaluationDate: new Date().toISOString(),
        overallRating,
        averageScore: calculateAverageScore()
      };

      // If we have existing data, update it
      if (existingData) {
        await axios.put(`/evaluations/${existingData.id}`, payload);
        toast.success("Evaluation updated successfully");
      } else {
        // Otherwise create a new evaluation
        await axios.post('/evaluations/create', payload);
        toast.success("Evaluation submitted successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("Failed to submit evaluation");
    } finally {
      setLoading(false);
    }
  };


  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const isTrainee = loggedInUser?.role === 'trainee';
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center black mt-4">
            Student Performance Evaluation
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white rounded-lg p-0">
          {/* Student Information */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name:</p>
                <p className="font-medium">{student?.first_name} {student?.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Program:</p>
                <p className="font-medium">{student?.programName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">College:</p>
                <p className="font-medium">{student?.collegeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Evaluation Date:</p>
                <p className="font-medium">{existingData?.evaluationDate ? new Date(existingData.evaluationDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Evaluation Questions */}
          {!isTrainee && <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <Label className="text-lg font-medium mb-2 block">{q.question}</Label>
                <RadioGroup
                  value={answers[`question_${index}`]}
                  onValueChange={(value) => handleRadioChange(index, value)}
                  disabled={viewOnly}
                  className="space-y-2"
                >
                  {q.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                      <RadioGroupItem
                        value={choice}
                        id={`q${index}_c${choiceIndex}`}
                        disabled={viewOnly}
                      />
                      <Label
                        htmlFor={`q${index}_c${choiceIndex}`}
                        className="cursor-pointer w-full flex items-center"
                      >
                        {choice} - {ratingLabels[choice]}
                        <span className="ml-2">
                          {"★".repeat(parseInt(choice))}
                          {"☆".repeat(5 - parseInt(choice))}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
          }

          {/* Average Score Display */}
          {!isTrainee && <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Average Score</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{calculateAverageScore()}</span>
              <span className="text-yellow-500 text-2xl">
                {"★".repeat(Math.round(calculateAverageScore()))}
                {"☆".repeat(5 - Math.round(calculateAverageScore()))}
              </span>
            </div>
          </div>
          }

          {/* Overall Rating Selection */}
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <Label className="text-lg font-medium mb-2 block">Overall Rating</Label>
            <RadioGroup
              value={overallRating}
              onValueChange={setOverallRating}
              disabled={viewOnly}
              className="space-y-2"
            >
              {Object.entries(ratingLabels).reverse().map(([value, label]) => (
                <div key={value} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <RadioGroupItem value={value} id={`overall_${value}`} disabled={viewOnly} />
                  <Label htmlFor={`overall_${value}`} className="cursor-pointer w-full">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Comments Section */}
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <Label htmlFor="comments" className="text-lg font-medium mb-2 block">
              Additional Comments
            </Label>
            <Textarea
              id="comments"
              placeholder="Please provide any additional feedback or comments about the student's performance..."
              value={comments}
              onChange={handleCommentsChange}
              disabled={viewOnly}
              className="min-h-[120px]"
            />
          </div>

          {/* Signature Section */}
          {!viewOnly ? (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <Label className="text-lg font-medium mb-2 block">Evaluator's Signature</Label>
              <div className="border border-gray-300 rounded-lg bg-white">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'w-full h-[200px] border rounded-lg'
                  }}
                  backgroundColor="white"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" onClick={clearSignature} size="sm">
                  Clear
                </Button>
                <Button type="button" onClick={saveSignature} size="sm">
                  Save Signature
                </Button>
              </div>
              {signatureData && (
                <p className="text-green-600 text-sm mt-2">✓ Signature saved</p>
              )}
            </div>
          ) : (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <Label className="text-lg font-medium mb-2 block">Evaluator's Signature</Label>
              {signatureData ? (
                <div className="border border-gray-300 rounded-lg p-2 bg-white">
                  <img src={signatureData} alt="Signature" className="max-h-[200px]" />
                </div>
              ) : (
                <p className="text-gray-500 italic">No signature provided</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 space-x-2">
          {viewOnly ? (
            <>
              {/* <Button onClick={() => setViewOnly(false)} variant="outline">
                Edit Evaluation
              </Button> */}
              <Button onClick={onClose}>
                Close
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Evaluation"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EvaluationForm; 
