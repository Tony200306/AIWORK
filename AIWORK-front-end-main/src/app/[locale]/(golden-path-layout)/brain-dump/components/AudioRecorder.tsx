import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import React, { useState, useRef } from "react";
import { FileInfo } from "../type";
import { transcribe } from "@/services/transcribe/transcribe";
interface Props {
  setFiles?: React.Dispatch<React.SetStateAction<FileInfo[]>>;
  setInput?: React.Dispatch<React.SetStateAction<string>>;
}
export const AudioRecorder = ({ setInput }: Props) => {
  // State để quản lý trạng thái
  const [isRecording, setIsRecording] = useState(false);

  // Dùng useRef để giữ giá trị qua các lần render mà không gây render lại
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // 1. BẮT ĐẦU GHI ÂM
  const startRecording = async () => {
    try {
      // Xin quyền truy cập microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Khởi tạo MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Reset mảng chứa dữ liệu
      chunksRef.current = [];

      // Sự kiện: Khi có dữ liệu âm thanh được ghi lại (nó bắn ra liên tục)
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Sự kiện: Khi bấm dừng ghi âm
      mediaRecorderRef.current.onstop = async () => {
        // Tạo một Blob từ các mảnh (chunks) thu được
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        const res = await transcribe({ file: blob as File });
        setInput((prev) => prev + " " + res.text);
        // Tắt mic (để không hiện chấm đỏ trên tab nữa)
        stream.getTracks().forEach((track) => track.stop());
      };

      // Bắt đầu ghi
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Lỗi truy cập micro:", err);
      alert("Bạn cần cho phép truy cập microphone để ghi âm!");
    }
  };

  // 2. DỪNG GHI ÂM
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        size="lg"
        variant={isRecording ? "destructive" : "default"}
        className={isRecording ? "animate-pulse" : ""}
      >
        <Mic className={`w-5 h-5 ${isRecording ? "text-white" : "text-black"}`} />
        {isRecording ? "Stop Recording" : ""}
      </Button>
    </div>
  );
};

export default AudioRecorder;
