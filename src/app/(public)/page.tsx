'use client'
import { useState } from "react";
import Banner from "@/components/banner";
import Produtos from "@/components/produtos";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <Banner />
            <div className="md:px-20 px-5 py-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-4">Nossa Coleção</h2>
                    <p className="text-gray-300 text-lg mb-6">Encontre o produto perfeito para você</p>
                    <style jsx global>{`
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .animate-blink {
    animation: blink 1.5s infinite;
  }
`}</style>
                    <div className="text-red-500 text-center animate-blink">
                        <p className="font-semibold">🚨ATENÇÃO!🚨</p>
                        <p>Retirada grátis! Em caso de entrega, taxa de apenas R$ 7,00.</p>
                    </div>
                    {/* <div>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <button className="text-cyan-400 hover:text-cyan-300  text-sm mt-4 cursor-pointer">
                                    Leia nossos Termos de Garantia
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-cyan-900/50">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-cyan-400">
                                        Termos e Condições
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-300">
                                        Leia nossos termos de uso e políticas
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 space-y-4 text-gray-300">
                                    <section>
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">1. Aceitação dos Termos</h3>
                                        <p>
                                            Ao utilizar nossos serviços, você concorda em cumprir e ficar vinculado aos
                                            termos e condições aqui estabelecidos. Se você não concordar com qualquer
                                            parte destes termos, não deve usar nossos serviços.
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">2. Produtos e Serviços</h3>
                                        <p>
                                            Nos esforçamos para exibir com precisão as cores e imagens dos nossos produtos.
                                            No entanto, não podemos garantir que a exibição de qualquer cor seja precisa.
                                            Reservamo-nos o direito de descontinuar qualquer produto a qualquer momento.
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">3. Preços e Pagamento</h3>
                                        <p>
                                            Os preços dos produtos estão sujeitos a alterações sem aviso prévio.
                                            Reservamo-nos o direito de modificar ou descontinuar promoções a qualquer momento.
                                            O pagamento deve ser efetuado no momento da compra através dos métodos disponíveis.
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">4. Entrega</h3>
                                        <p>
                                            Os prazos de entrega são estimativas e podem variar dependendo da localização
                                            e disponibilidade do produto. Não nos responsabilizamos por atrasos causados
                                            por fatores externos como condições climáticas ou problemas de transporte.
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">5. Política de Devolução</h3>
                                        <p>
                                            Aceitamos devoluções dentro de 30 dias da data de compra, desde que o produto
                                            esteja em sua condição original e com a embalagem. O cliente é responsável
                                            pelos custos de envio para devolução.
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">6. Privacidade</h3>
                                        <p>
                                            Respeitamos sua privacidade e nos comprometemos a proteger suas informações
                                            pessoais. Coletamos apenas as informações necessárias para processar seu pedido
                                            e melhorar nossos serviços.
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">7. Limitação de Responsabilidade</h3>
                                        <p>
                                            Nossa responsabilidade é limitada ao valor do produto adquirido.
                                            Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais.
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">8. Contato</h3>
                                        <p>
                                            Para questões sobre estes termos ou nossos serviços, entre em contato
                                            conosco através do WhatsApp ou pelos canais de atendimento disponíveis.
                                        </p>
                                    </section>


                                </div>
                            </DialogContent>
                        </Dialog>
                    </div> */}
                </div>

                <Produtos />

                <div className="">
                    <div className="text-center md:mt-16 mt-8 md:p-8 p-4 bg-gray-900/80 rounded-2xl border border-cyan-900/50">
                        <h3 className="text-2xl font-bold text-cyan-400 mb-4">Gostou dos nossos produtos?</h3>
                        <p className="text-gray-300 mb-6">
                            Faça seu pedido clicando no botão azul no produto, ou entre em contato pelo WhatsApp ou Instagram!
                        </p>

                        {/* Botões de contato */}
                        <div className="flex justify-center gap-4 mb-6">
                            <a
                                href="https://wa.me/5532999392474?text=Olá!%20Gostaria%20de%20fazer%20um%20pedido"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-300"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                            </a>

                            <a
                                href="https://www.instagram.com/elfpods01?igsh=dzN2bmV6ZTlzZWk3"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                Instagram
                            </a>
                        </div>

                        {/* Features */}
                        <div className="flex justify-center gap-4 flex-wrap">
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