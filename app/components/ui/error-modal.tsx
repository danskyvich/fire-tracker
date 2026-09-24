import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ErrorModalProps {
    message: string,
    duration?: number,
}

export default function ErrorModal({message, duration = 5000}: ErrorModalProps) {

    const [dismissedMessage, setDismissMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setDismissMessage(message);
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration]);

    const visible = !!message && message != dismissedMessage;

    if (!visible) return null;

    return(
        <div className="flex w-fit max-w-fit md:max-w-[22.5%] h-fit bg-red-700 fixed inset-0 text-[0.8rem] md:text-[0.9rem] m-5 px-5 py-2 rounded-lg items-start gap-2 shadow-md">
            <InfoIcon size={18} className="min-w-5 h-auto"/>
            <p className="text-sm font-mono">{message}</p>
        </div>
    )
}