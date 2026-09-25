import { ArrowUpRight, X } from "lucide-react";
import { redirect } from "next/navigation";
import Image from "next/image";

export default function WebAppPage({onClose, open}: {onClose: () => void, open: number | null}) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 pointer-events-auto flex w-full h-full bg-(--color-background)/75 items-center justify-center">
        <div className="flex flex-col w-200 h-fit">
          {/* Header */}
          <div className="flex w-full items-center justify-between">
            <div className="flex w-full text-5xl font-semibold whitespace-nowrap gap-5">
              <Image src="/icon.png" alt="alt" width={50} height={12} />
              <p>Wildfire Tracker</p>
            </div>
            <X className="min-w-5 h-auto cursor-pointer" onClick={onClose} />
          </div>

          {/* Content */}
          <div className="flex flex-col w-full h-fit my-5 text-lg">
            <p>
              Wildfire Tracker is a web application for monitoring thermal
              hotspots around the world and determining whether detected
              hotspots may correspond to active wildfires. The application
              retrieves fire-related data from NASA’s Fire Information for
              Resource Management System (FIRMS) using observations coming 
              from the Suomi NPP satellite, which provides publicly
              available satellite-based observations of thermal anomalies.
              <br/>
              <br/>
              Currently, Wildfire Tracker displays global thermal hotspots
              detected during the current day. The application
              also provides Air Quality Index (AQI) information using data from
              AQICN, giving users additional environmental context around
              detected fire activity. The project is intended to make publicly
              available fire and air-quality data easier to visualize and
              understand through an interactive web interface.
              <br />
              <br />
              <span>Current version: v1.0.2</span>
            </p>
            <div className="flex w-full items-center justify-between my-5">
              <p className="text-sm">Made by: Danilo Pelin Jr.</p>

              <div
                className="flex w-fit h-fit rounded-lg border border-(--color-primary) hover:bg-(--color-primary) px-3 py-2 gap-2 cursor-pointer hover:text-background duration-100 transition-all"
                onClick={() => redirect("https://danppelin.vercel.app")}
              >
                <ArrowUpRight
                  size={18}
                  className="min-w-4 h-auto cursor-pointer"
                />
                <p className="font-semibold text-sm">Visit portfolio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}