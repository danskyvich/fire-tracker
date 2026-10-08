import { ArrowUpRight, X } from "lucide-react";
import { redirect } from "next/navigation";
import Image from "next/image";

export default function WebAppPage({onClose, open}: {onClose: () => void, open: number | null}) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 pointer-events-auto flex w-full h-full bg-(--color-background)/75 items-center justify-center">
        <div className="flex flex-col w-200 h-fit p-5">
          {/* Header */}
          <div className="flex w-full items-center justify-between">
            <div className="flex w-full text-xl md:text-2xl lg:text-5xl font-semibold whitespace-nowrap gap-5 items-center">
              <Image
                src="/icon.png"
                alt="alt"
                className="min-w-3 h-auto"
                width={50}
                height={12}
              />
              <p>Wildfire Tracker</p>
            </div>
            <X className="min-w-5 h-auto cursor-pointer" onClick={onClose} />
          </div>

          {/* Content */}
          <div className="flex flex-col w-full h-fit my-5 text-[0.75rem] md:text-sm lg:text-lg">
            <p>
              Wildfire Tracker is a web application for monitoring thermal
              hotspots around the world and determining whether detected
              hotspots may correspond to active wildfires. The application
              retrieves fire-related data from NASA’s Fire Information for
              Resource Management System (FIRMS) using observations coming from
              the Suomi NPP satellite, which provides publicly available
              satellite-based observations of thermal anomalies.
              <br />
              <br />
              Currently, Wildfire Tracker displays global thermal hotspots
              detected during the current day. The application also provides Air
              Quality Index (AQI) information using data from AQICN, giving
              users additional environmental context around detected fire
              activity. The project is intended to make publicly available fire
              and air-quality data easier to visualize and understand through an
              interactive web interface.
              <br />
              <br />
              <span>Current version: v1.0.2</span>
            </p>
            <div className="flex w-full items-center justify-between my-5">
              <p className="text-[0.75rem] md:text-sm lg:text-lg">
                Made by: Danilo Pelin Jr.
              </p>

              <a
                className="flex w-fit h-fit border border-white rounded-lg text-[0.75rem] md:text-sm lg:text-lg hover:bg-(--color-contained-stroke) active:bg-(--color-partial-stroke) px-3 py-1"
                href="https://danppelin.vercel.app"
                rel="noreferrer noopener"
                target="_blank"
              >
                Visit my portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    );
}