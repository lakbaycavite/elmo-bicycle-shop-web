import React, { useState, useEffect } from 'react';
import { RotateCcw, Gift, Settings, Ticket, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useDiscount } from '../../hooks/useDiscount';
import { useNavigate } from 'react-router-dom';

const SpinTheWheel = ({ isAdmin = false }) => {
    const {
        spinWheelConfig,
        userSpinAttempts,
        userVouchers,
        loading,
        error,
        spinResult,
        handleSpin,
        updateSpinConfig,
        clearSpinResult,
        availableVouchers,
        hasSpinAttempts
    } = useDiscount();

    const navigate = useNavigate();

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    // 🔹 New cooldown state
    const [lastSpinTime, setLastSpinTime] = useState(null);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const COOLDOWN_DURATION = 5; // seconds

    // Update countdown every second
    useEffect(() => {
        if (!lastSpinTime) return;

        const interval = setInterval(() => {
            const diff = Math.max(
                0,
                COOLDOWN_DURATION - Math.floor((Date.now() - lastSpinTime) / 1000)
            );
            setCooldownRemaining(diff);

            if (diff === 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [lastSpinTime]);

    const performSpin = async () => {
        // Block spin if in cooldown
        if (!hasSpinAttempts || isSpinning || cooldownRemaining > 0) return;

        setIsSpinning(true);
        clearSpinResult();

        try {
            const result = await handleSpin();
            const resultIndex = spinWheelConfig.segments.findIndex(
                seg => seg.id === result.result.id
            );

            const segmentAngle = 90;
            const minSpins = 5;
            const randomSpins = Math.floor(Math.random() * 3);
            const segmentCenter = (resultIndex * segmentAngle) + (segmentAngle / 2);
            const targetAngle = 360 - segmentCenter;
            const totalRotation = (minSpins * 360) + (randomSpins * 360) + targetAngle;

            setRotation(totalRotation);

            setTimeout(() => {
                setIsSpinning(false);
                setLastSpinTime(Date.now()); // 🔹 Start cooldown after spin finishes
                setCooldownRemaining(COOLDOWN_DURATION);
            }, 3000);

        } catch (err) {
            setIsSpinning(false);
            console.error("Spin failed:", err);
        }
    };

    const updateSegment = (index, field, value) => {
        const newSegments = [...configForm.segments];
        newSegments[index] = { ...newSegments[index], [field]: value };
        setConfigForm({ ...configForm, segments: newSegments });
    };

    if (!spinWheelConfig) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const segmentAngle = 360 / spinWheelConfig.segments.length;

    return (
        <div className="max-w-4xl mx-auto p-6 ">
            {/* Back Button */}
<button
    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none"
    onClick={() => navigate('/')}
>
    Back
</button>


            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2"> Spin the Wheel</h1>
                <p className="text-gray-600">
                    Spend ₱{spinWheelConfig.minOrderAmount}+ to earn spin attempts!
                </p>
            </div>

            {/* User Stats */}
        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg text-center">
                    <RotateCcw className="mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold">{userSpinAttempts}</div>
                    <div className="text-sm opacity-90">Spin Attempts</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg text-center">
                    <Ticket className="mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold">{availableVouchers.length}</div>
                    <div className="text-sm opacity-90">Available Vouchers</div>
                </div>
            </div>

            {/* Admin Controls */}
            {isAdmin && (
                <div className="mb-6">
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Settings size={16} />
                        {showConfig ? 'Hide' : 'Show'} Configuration
                    </button>
                </div>
            )}

            {/* Configuration Panel */}
            {isAdmin && showConfig && configForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-xl font-bold mb-4">Wheel Configuration</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Minimum Order Amount (₱)
                        </label>
                        <input
                            type="number"
                            value={configForm.minOrderAmount}
                            onChange={(e) => setConfigForm({
                                ...configForm,
                                minOrderAmount: parseInt(e.target.value)
                            })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Wheel Segments</h4>
                        <div className="space-y-2">
                            {configForm.segments.map((segment, index) => (
                                <div key={segment.id} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={segment.label}
                                        onChange={(e) => updateSegment(index, 'label', e.target.value)}
                                        className="flex-1 p-2 border rounded"
                                        placeholder="Label"
                                    />
                                    <input
                                        type="number"
                                        value={segment.discount}
                                        onChange={(e) => updateSegment(index, 'discount', parseInt(e.target.value))}
                                        className="w-20 p-2 border rounded"
                                        placeholder="Discount %"
                                    />
                                    <input
                                        type="color"
                                        value={segment.color}
                                        onChange={(e) => updateSegment(index, 'color', e.target.value)}
                                        className="w-12 h-10 border rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleConfigSave}
                        disabled={loading}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                        Save Configuration
                    </button>
                </div>
            )}

            {/* Wheel Container */}
            <div className="relative flex justify-center items-center mb-8">
                <div className="relative">
                    {/* Wheel */}
                    <svg
                        width="320"
                        height="320"
                        className={`transition-transform duration-3000 ease-out ${isSpinning ? 'animate-pulse' : ''}`}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: 'center',
                            transitionDuration: isSpinning ? '3s' : '0.3s'
                        }}
                    >
{/* Outer ring */}
<circle
    cx="160"
    cy="160"
    r="156"
    fill="none"
    stroke="#1f2937"
    strokeWidth="8"
/>

{/* 4 Segments */}
{spinWheelConfig.segments.map((segment, index) => {
    const startAngle = (index * 90 - 90) * Math.PI / 180;
    const endAngle = ((index + 1) * 90 - 90) * Math.PI / 180;
    const midAngle = (startAngle + endAngle) / 2;

    // Calculate path for segment
    const x1 = 160 + 150 * Math.cos(startAngle);
    const y1 = 160 + 150 * Math.sin(startAngle);
    const x2 = 160 + 150 * Math.cos(endAngle);
    const y2 = 160 + 150 * Math.sin(endAngle);

    const pathData = [
        `M 160 160`,
        `L ${x1} ${y1}`,
        `A 150 150 0 0 1 ${x2} ${y2}`,
        `Z`
    ].join(' ');

    // Calculate text position
    const textRadius = 100;
    const textX = 160 + textRadius * Math.cos(midAngle);
    const textY = 160 + textRadius * Math.sin(midAngle);
    const textRotation = (midAngle * 180 / Math.PI) + 90;

    // Conditional color for segments (black and orange)
    const segmentColor = segment.label === "Try Again" ? "#f93c1bff" : "#000000"; // Orange for "Try Again", Black for others

    return (
        <g key={segment.id}>
            <path
                d={pathData}
                fill={segmentColor} // Apply the color
                stroke="#fff"
                strokeWidth="2"
            />
            <text
                x={textX}
                y={textY}
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRotation} ${textX} ${textY})`}
                style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}
            >
                {segment.label}
            </text>
        </g>
    );
})}

                    </svg>


                    {/* Center Circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                        
                   <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2">
    <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-gray-800"></div>
</div>

                    </div>
                </div>
            </div>

            {/* Spin Button */}
            <div className="text-center mb-8">
 <button
            onClick={performSpin}
            disabled={!hasSpinAttempts || isSpinning || loading || cooldownRemaining > 0}
            className={`px-8 py-4 rounded-full text-xl font-bold transition-all ${
                hasSpinAttempts && !isSpinning && cooldownRemaining === 0
                    ? "bg-gradient-to-r from-orange-400 to-red-500 text-white hover:shadow-lg transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
            {isSpinning ? (
                <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Spinning...
                </span>
            ) : cooldownRemaining > 0 ? (
                `⏳ Wait ${cooldownRemaining}s`
            ) : hasSpinAttempts ? (
                "🎲 SPIN NOW!"
            ) : (
                "🔒 No Attempts Left"
            )}
        </button>

                {!hasSpinAttempts && (
                    <p className="text-gray-500 mt-2">
                        Make a purchase of ₱{spinWheelConfig.minOrderAmount}+ to earn spin attempts!
                    </p>
                )}
            </div>

            {/* Spin Result Modal */}
            {spinResult && !isSpinning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
                        {spinResult.result.discount > 0 ? (
                            <>
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-2xl font-bold text-green-600 mb-2">
                                    Congratulations!
                                </h3>
                                <p className="text-lg mb-4">
                                    You won <span className="font-bold text-green-600">
                                        {spinResult.result.discount}% OFF
                                    </span>
                                </p>
                                <p className="text-gray-600 mb-6">
                                    A voucher has been added to your account!
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-6xl mb-4">😔</div>
                                <h3 className="text-2xl font-bold text-gray-600 mb-2">
                                    Better Luck Next Time!
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Keep shopping to earn more spin attempts!
                                </p>
                            </>
                        )}

                        <div className="text-sm text-gray-500 mb-4">
                            Remaining attempts: {spinResult.remainingAttempts}
                        </div>

                        <button
                            onClick={clearSpinResult}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* User Vouchers Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Ticket className="text-orange-600" />
                    My Vouchers
                </h2>

                {userVouchers.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <Gift size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No vouchers yet. Spin the wheel to win discounts!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userVouchers.map((voucher) => (
                            <div
                                key={voucher.id}
                                className={`border rounded-lg p-4 ${voucher.isUsed
                                    ? 'border-gray-300 bg-gray-50'
                                    : voucher.isExpired
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-green-300 bg-green-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {voucher.isUsed ? (
                                            <CheckCircle className="text-gray-500" size={20} />
                                        ) : voucher.isExpired ? (
                                            <XCircle className="text-red-500" size={20} />
                                        ) : (
                                            <Ticket className="text-green-500" size={20} />
                                        )}
                                        <span className="font-bold text-lg">
                                            {voucher.discountPercentage}% OFF
                                        </span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${voucher.isUsed
                                        ? 'bg-gray-200 text-gray-600'
                                        : voucher.isExpired
                                            ? 'bg-red-200 text-red-600'
                                            : 'bg-green-200 text-green-600'
                                        }`}>
                                        {voucher.isUsed ? 'Used' : voucher.isExpired ? 'Expired' : 'Available'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">
                                    {voucher.description}
                                </p>

                                <div className="text-xs text-gray-500">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span>Code: <span className="font-mono font-bold">{voucher.code}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>
                                            {voucher.isUsed
                                                ? `Used: ${new Date(voucher.usedAt).toLocaleDateString()}`
                                                : `Expires: ${new Date(voucher.expiresAt).toLocaleDateString()}`
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default SpinTheWheel;