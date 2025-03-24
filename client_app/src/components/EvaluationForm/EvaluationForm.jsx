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
    choices: ["Excellent", "Above Average", "Average", "Below Average", "Unreliable"]
  },
  {
    question: "B. Quantity of Work",
    choices: ["Exceptionally productive", "Very productive", "Average productive", "Very slow to produce output", "Rather slow to produce output"]
  },
  {
    question: "C. Relation with Others",
    choices: ["Exceptionally accepted", "Works well with others", "Gets along satisfactory", "Has some problems working with others", "Works very poorly with others"]
  },
  {
    question: "D. Attitude Towards Work",
    choices: ["Exceptionally enthusiastic", "Shows initiative in his/her work", "Average in diligence", "Somewhat indifferent", "Definitely not interested"]
  },
  {
    question: "E. Dependability",
    choices: ["Excellent", "Above Average", "Average", "Below Average", "Unreliable"]
  },
  {
    question: "F. Ability to Learn",
    choices: ["Exceptionally fast learner", "Learns rapidly", "Average learner", "Rather slow to learn", "Very slow to learn"]
  },
  {
    question: "G. Attendance",
    choices: ["Exceptionally perfect", "Keeps good attendance record", "Acceptable working attendance", "Needs improvement", "Cannot meet working schedule"]
  },
  {
    question: "H. Judgement",
    choices: ["Exceptionally matured", "Above average in making decision", "Usually makes the right decision", "Often uses poor judgement", "Consistently uses bad judgement"]
  }
];

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

  useEffect(() => {
    if (existingData) {
      setAnswers(existingData.answers);
      setComments(existingData.comments);
      setSignatureData(existingData.signature);
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
        evaluationDate: new Date().toISOString()
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
          <div className="space-y-6">
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
                        className="cursor-pointer w-full"
                      >
                        {choice}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
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