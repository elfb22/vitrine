import Banner from "@/components/banner";
import Produtos from "@/components/produtos";


export default function Home() {
    return (
        <div>
            <Banner />
            <div className="md:px-20 px-5 py-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-4">Nossa Coleção</h2>
                    <p className="text-gray-300 text-lg mb-6">Encontre o produto perfeito para você</p>
                </div>
                <Produtos />
                <div className=" ">
                    <div className="text-center md:mt-16 mt-8 md:p-8 p-4 bg-gray-900/80 rounded-2xl border border-cyan-900/50">
                        <h3 className="text-2xl font-bold text-cyan-400 mb-4">Gostou dos nossos produtos?</h3>
                        <p className="text-gray-300 mb-6">Entre em contato pelo WhatsApp e faça seu pedido!</p>
                        <div className="flex justify-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                Entrega rápida
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                Pagamento facilitado
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                                Qualidade garantida
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
