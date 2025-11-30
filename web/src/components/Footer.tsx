function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">Гар урлал дэлгүүр</h3>
            <p className="text-gray-400 text-sm">
              Монголын гар урлалчдын бүтээгдэхүүнийг худалдан авах, борлуулах хялбар платформ.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Холбоосууд</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/products" className="text-gray-400 hover:text-white transition">
                  Бүтээгдэхүүн
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-400 hover:text-white transition">
                  Худалдагч болох
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Тусламж
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Холбоо барих</h3>
            <p className="text-gray-400 text-sm">
              И-мэйл: contact@handmade.mn
              <br />
              Утас: +976 7000-0000
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          © 2024 Гар урлал дэлгүүр. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
