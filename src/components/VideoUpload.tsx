import { useCallback, useState, useRef } from "react";
import { Upload, Video, Zap, Eye, RotateCcw } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function VideoUpload() {
  const loadData = useStore((s) => s.loadData);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [sideUploaded, setSideUploaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (_view: "front" | "side") => {
      if (_view === "front") setFrontUploaded(true);
      else setSideUploaded(true);
    },
    []
  );

  const handleDemo = useCallback(() => {
    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    const interval = setInterval(() => {
      setAnalyzeProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 2;
      });
    }, 25);
    setTimeout(() => {
      loadData();
      setIsAnalyzing(false);
    }, 1500);
  }, [loadData]);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    const steps = [
      { pct: 20, msg: "识别骨骼关键点..." },
      { pct: 45, msg: "计算关节角度..." },
      { pct: 65, msg: "分析步态周期..." },
      { pct: 85, msg: "生成3D模型..." },
      { pct: 100, msg: "分析完成" },
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setAnalyzeProgress(steps[i].pct);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    setTimeout(() => {
      loadData();
      setIsAnalyzing(false);
    }, 2500);
  }, [loadData]);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-electric/30 rounded-full" />
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-electric rounded-full animate-spin" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-electric w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-electric font-display text-xl tracking-wider">正在分析跑步姿势</p>
          <p className="text-gray-400 text-sm mt-2 font-body">
            {analyzeProgress < 25 ? "AI 正在识别骨骼关键点..." :
             analyzeProgress < 50 ? "计算关节角度数据..." :
             analyzeProgress < 75 ? "分析步态周期特征..." :
             analyzeProgress < 95 ? "生成3D人体模型..." : "分析完成！"}
          </p>
        </div>
        <div className="w-72 h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-electric to-neon-green rounded-full transition-all duration-200"
            style={{ width: `${analyzeProgress}%` }}
          />
        </div>
        <div className="text-gray-500 text-xs font-mono">{analyzeProgress}%</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
      <div className="text-center mb-4">
        <h2 className="text-electric font-display text-3xl tracking-wider uppercase">上传跑步视频</h2>
        <p className="text-gray-400 mt-2 font-body text-sm">上传正面和侧面视角的跑步视频，系统将自动分析您的跑步姿势</p>
        <p className="text-gray-600 mt-1 font-body text-xs">支持 MP4 / MOV / AVI 格式，建议时长 10-30 秒</p>
      </div>

      <div className="flex gap-6">
        <UploadZone
          label="正面视角"
          description="面向镜头跑步"
          icon={<Eye className="w-8 h-8" />}
          uploaded={frontUploaded}
          inputRef={frontInputRef}
          onFileSelect={() => handleFileSelect("front")}
        />
        <UploadZone
          label="侧面视角"
          description="侧面跑步拍摄"
          icon={<Video className="w-8 h-8" />}
          uploaded={sideUploaded}
          inputRef={sideInputRef}
          onFileSelect={() => handleFileSelect("side")}
        />
      </div>

      <div className="flex flex-col items-center gap-3 mt-4">
        <button
          onClick={handleAnalyze}
          disabled={!frontUploaded && !sideUploaded}
          className="px-8 py-3 bg-electric/20 border border-electric/50 rounded-lg text-electric font-display tracking-wider text-lg
                     hover:bg-electric/30 hover:border-electric hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          开始分析
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDemo}
            className="px-6 py-2 bg-neon-orange2/10 border border-neon-orange2/30 rounded-lg text-neon-orange2 font-body text-sm
                       hover:bg-neon-orange2/20 hover:border-neon-orange2/60 transition-all duration-300
                       flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            使用示例数据演示
          </button>
        </div>
        <p className="text-gray-600 text-[11px] font-body mt-1">演示模式将使用预设数据展示完整的分析功能</p>
      </div>
    </div>
  );
}

function UploadZone({
  label,
  description,
  icon,
  uploaded,
  inputRef,
  onFileSelect,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  uploaded: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: () => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onFileSelect();
    }
  };

  return (
    <div
      className={`w-60 h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300
        ${
          uploaded
            ? "border-neon-green/50 bg-neon-green/5"
            : isDragOver
            ? "border-electric bg-electric/5"
            : "border-gray-600 bg-dark-700/50 hover:border-electric/50 hover:bg-dark-700"
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelect();
          }
        }}
      />
      {uploaded ? (
        <>
          <div className="w-12 h-12 rounded-full bg-neon-green/10 flex items-center justify-center">
            <Video className="w-6 h-6 text-neon-green" />
          </div>
          <div className="text-center">
            <span className="text-neon-green font-display text-sm tracking-wider">已上传</span>
            <p className="text-gray-500 text-[10px] font-body mt-0.5">{label}</p>
          </div>
        </>
      ) : (
        <>
          <div className={`transition-colors ${isDragOver ? "text-electric" : "text-gray-500"}`}>
            {icon}
          </div>
          <div className="text-center">
            <span className={`font-display text-sm tracking-wider ${isDragOver ? "text-electric" : "text-gray-400"}`}>
              {isDragOver ? "松开上传" : label}
            </span>
            <p className="text-gray-500 text-[10px] font-body mt-0.5">{description}</p>
          </div>
          <div className="flex items-center gap-1 text-gray-600 text-[10px]">
            <Upload className="w-3 h-3" />
            <span>点击或拖拽视频文件</span>
          </div>
        </>
      )}
    </div>
  );
}
