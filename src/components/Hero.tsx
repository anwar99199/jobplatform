import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Hero() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-4 items-center justify-center">
          <Button className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-6 rounded-full">
            ابحث الآن
          </Button>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="أدخل كلمة البحث"
              className="w-full py-6 px-6 rounded-full border-gray-300 text-right"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
