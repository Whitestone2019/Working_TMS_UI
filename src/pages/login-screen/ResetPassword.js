import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { sendOtp, resetPassword } from "../../api_service";



const ResetPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        trngId: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!form.trngId) newErrors.trngId = "Trainee/Manager ID is required";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setIsLoading(true);

            const response = await sendOtp(form.trngId);
            if (response?.status === 200) {
                alert("OTP sent successfully");
                setIsLoading(false);
                setStep(2);
            } else {
                setErrors({
                    general: response?.message || "Failed to send OTP. Please try again.",
                });
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error in sending OTP:", error);
        }
    };



    const handleResetPassword = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!form.otp) newErrors.otp = "OTP is required";
        if (!form.newPassword) newErrors.newPassword = "New password is required";
        if (form.newPassword.length < 8)
            newErrors.newPassword = "Password must be at least 8 characters";
        if (form.newPassword !== form.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {

            setIsLoading(true);
            const response = await resetPassword({
                trngId: form.trngId,
                otp: form.otp,
                newPassword: form.newPassword
            });
            if (response?.status === 200) {
                alert("Password reset successfully");
                setIsLoading(false);
                navigate("/");
            } else {
                setErrors({
                    general: response?.message || "Failed to reset password. Please try again.",
                });
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error in resetting password:", error);
        }


    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background from-slate-50 to-slate-100 px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(30, 58, 138, 0.3) 1px, transparent 0)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <div className="relative w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 elevation-2">
                        <Shield className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-black mb-2">
                        Trainee Management System
                    </h1>
                    <p className="text-muted-foreground">
                        Reset your account password securely
                    </p>
                </div>

                {/* Reset Card */}
                <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                    <div className="p-8">
                        <h2 className="text-xl font-semibold text-card-foreground mb-6 text-center">
                            {step === 1 ? "Forgot Password" : "Reset Password"}
                        </h2>

                        <form
                            onSubmit={step === 1 ? handleSendOTP : handleResetPassword}
                            className="space-y-6"
                        >
                            {/* Error Box */}
                            {errors.general && (
                                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                    <p className="text-sm text-destructive">
                                        {errors.general}
                                    </p>
                                </div>
                            )}

                            {/* STEP 1 */}
                            {step === 1 && (
                                <div className="relative">
                                    <Input
                                        label="Trainee/Manager ID"
                                        type="text"
                                        required
                                        value={form.trngId}
                                        onChange={(e) =>
                                            handleChange("trngId", e.target.value)
                                        }
                                        error={errors.trngId}
                                        placeholder="Enter your registered Trainee/Manager ID"
                                        className="pl-10"
                                    />
                                    <Mail className="absolute left-3 top-9 w-4 h-4 text-muted-foreground" />
                                </div>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <>
                                    <Input
                                        label="OTP"
                                        type="text"
                                        required
                                        value={form.otp}
                                        onChange={(e) =>
                                            handleChange("otp", e.target.value)
                                        }
                                        error={errors.otp}
                                        placeholder="Enter OTP"
                                    />

                                    <div className="relative">
                                        <Input
                                            label="New Password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={form.newPassword}
                                            onChange={(e) =>
                                                handleChange("newPassword", e.target.value)
                                            }
                                            error={errors.newPassword}
                                            placeholder="Enter new password"
                                            className="pl-10 pr-10"
                                        />
                                        <Lock className="absolute left-3 top-9 w-4 h-4 text-muted-foreground" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        required
                                        value={form.confirmPassword}
                                        onChange={(e) =>
                                            handleChange("confirmPassword", e.target.value)
                                        }
                                        error={errors.confirmPassword}
                                        placeholder="Confirm new password"
                                    />
                                </>
                            )}

                            <Button
                                type="submit"
                                loading={isLoading}
                                className="w-full"
                                size="lg"
                            >
                                {step === 1 ? "Send OTP" : "Reset Password"}
                            </Button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-muted/30 px-8 py-4 text-center">
                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-primary hover:text-primary/80"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
