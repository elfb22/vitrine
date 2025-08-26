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