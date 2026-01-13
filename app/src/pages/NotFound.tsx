/**
 * Description: หน้า 404 Not Found สำหรับ route ที่ไม่พบ
 * Input : -
 * Output : React Component (404 Page)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { Icon } from "@iconify/react";

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate("/home");
    };

    return (
        <div className="relative min-h-screen w-full bg-white overflow-hidden flex items-center justify-center">
            {/* Background SVG Blob - Same as Login page */}
            <div className="absolute -top-[220px] -left-[200px]">
                <svg
                    width="1183"
                    height="1162"
                    viewBox="0 0 1183 1162"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M417.274 75.2522C490.743 46.3708 557.552 -0.469721 637.901 0.819746C726.567 2.24268 812.512 38.7538 895.535 82.9275C998.757 137.848 1154.51 167.638 1180.17 289.338C1207.93 421.063 1014.06 479.614 1006.86 610.987C999.091 752.653 1180.77 888.308 1140.15 1019.48C1103.72 1137.1 950.249 1147.06 836.761 1160.18C735.418 1171.9 635.961 1118.73 533.93 1089.56C437.839 1062.09 340.469 1050.34 253.198 993.353C155.87 929.801 30.454 863.233 4.54279 743.892C-22.3482 620.038 88.2656 528.281 127.805 415.82C156.643 333.796 152.463 233.682 206.115 170.559C258.475 108.956 344.186 103.984 417.274 75.2522Z"
                        fill="url(#paint0_linear_404)"
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear_404"
                            x1="417.897"
                            y1="66.0808"
                            x2="853.545"
                            y2="1192.81"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#91D5FF" />
                            <stop offset="0.225" stopColor="#C8EAFF" />
                            <stop offset="0.538462" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Background Blurs */}
            <div className="absolute top-[200px] left-[150px] w-[500px] h-[400px] bg-sky-300/50 rounded-full blur-[200px]"></div>
            <div className="absolute top-[300px] right-[150px] w-[400px] h-[350px] bg-[#D7ABFF]/50 rounded-full blur-[200px]"></div>
            <div className="absolute bottom-20 left-1/2 w-[400px] h-[400px] bg-[#5292FF]/40 rounded-full blur-[200px]"></div>

            {/* Animated Decorative Icons */}
            <div className="absolute top-[15%] left-[10%] opacity-10 animate-bounce" style={{ animationDuration: '3s' }}>
                <Icon icon="fluent:box-search-24-filled" width="82" height="82" />
            </div>
            <div className="absolute top-[25%] right-[12%] opacity-10 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                <Icon icon="pepicons-print:wrench-circle" width="82" height="82" />
            </div>
            <div className="absolute bottom-[25%] left-[15%] opacity-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <Icon icon="fluent:box-checkmark-24-filled" width="82" height="82" />
            </div>
            <div className="absolute bottom-[30%] right-[18%] opacity-10 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.8s' }}>
                <Icon icon="mdi:file-document-outline" width="82" height="82" />
            </div>
            <div className="absolute top-[60%] left-[8%] opacity-5 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.3s' }}>
                <Icon icon="mdi:tools" width="60" height="60" />
            </div>
            <div className="absolute top-[10%] right-[30%] opacity-5 animate-bounce" style={{ animationDuration: '3.8s', animationDelay: '0.6s' }}>
                <Icon icon="mdi:package-variant" width="70" height="70" />
            </div>
            <div className="absolute bottom-[15%] right-[8%] opacity-10 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1.2s' }}>
                <Icon icon="mdi:cog-outline" width="65" height="65" />
            </div>
            <div className="absolute top-[45%] right-[5%] opacity-5 animate-bounce" style={{ animationDuration: '3.3s', animationDelay: '0.9s' }}>
                <Icon icon="mdi:clipboard-text-outline" width="55" height="55" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4">
                {/* 404 Text */}
                <h1 className="text-[120px] md:text-[180px] font-extrabold text-[#40A9FF] leading-none select-none">
                    404
                </h1>

                {/* Icon */}
                <div className="my-4">
                    <Icon
                        icon="mdi:file-search-outline"
                        className="w-20 h-20 mx-auto text-[#40A9FF]"
                    />
                </div>

                {/* Message */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                    ไม่พบหน้าที่คุณต้องการ
                </h2>
                <p className="text-gray-500 text-base md:text-lg mb-8 max-w-md mx-auto">
                    หน้าที่คุณกำลังค้นหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="secondary"
                        onClick={handleGoBack}
                        style={{ minWidth: 140, height: 48 }}
                    >
                        ← ย้อนกลับ
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleGoHome}
                        style={{ minWidth: 140, height: 48 }}
                    >
                        กลับหน้าหลัก
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
