import { ArrowUpRight, X } from "lucide-react";
import { redirect } from "next/navigation";

export default function WebAppPage({onClose, open}: {onClose: () => void, open: number | null}) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 pointer-events-auto flex w-full h-full bg-(--color-background)/75 items-center justify-center">
        <div className="flex flex-col w-200 h-fit">
          {/* Header */}
          <div className="flex w-full items-center justify-between">
            <p className="text-5xl font-semibold whitespace-nowrap">
              🔥WildfireTracker
            </p>
            <X className="min-w-5 h-auto cursor-pointer" onClick={onClose} />
          </div>

          {/* Content */}
          <div className="flex flex-col w-full h-fit my-5 text-lg">
            <p>
              Lorem ipsum dolor sit amet consectetur adipiscing elit et enim.
              Sunt quas occaecat consequatur facilis eum. Minus incididunt
              consectetur non praesentium officia illum est sint. Et culpa nulla
              sint dolor amet. Commodo possimus expedita non quo assumenda magna
              anim culpa eligendi esse. Fugiat laborum cum laborum velit quidem
              nostrud fugiat est libero blanditiis. Do fugiat est culpa
              praesentium anim temporibus qui blanditiis enim. Harum qui esse
              ea aliqua elit est aute vero. <br/><br/>Rerum commodo omnis fuga nulla
              similique. Culpa dignissimos quidem voluptate et nihil quo
              accusamus et in quibusdam. Assumenda veniam blanditiis at et quas
              magna quis quo nihil vero. Proident est amet aut sunt sit quo id
              cupiditate in. Ducimus occaecat nobis similique assumenda et
              dignissimos laborum consectetur laboris fugiat nihil quo. Nihil
              facilis tempor excepteur soluta facilis blanditiis. Sed adipiscing
              consequatur in in esse culpa amet laborum provident ut.
            </p>
            <div className="flex w-full items-center justify-between my-5">
              <p className="text-sm">Made by: Danilo Pelin Jr.</p>

              <div className="flex w-fit h-fit rounded-lg border border-(--color-primary) hover:bg-(--color-primary) px-3 py-2 gap-2 cursor-pointer hover:text-background" onClick={() => redirect("https://danppelin.vercel.app")}>
                <ArrowUpRight size={18} className="min-w-4 h-auto cursor-pointer"/>
                <p className="font-semibold text-sm">Visit portfolio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}