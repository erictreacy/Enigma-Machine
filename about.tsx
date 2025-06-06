"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Users, BookOpen, Cpu, Clock, Award } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-amber-400">About the Enigma Machine</h1>
          <p className="text-xl text-amber-200">A Journey Through History's Most Famous Cipher</p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="bg-amber-600 text-amber-50">
              Historical Simulation
            </Badge>
            <Badge variant="secondary" className="bg-amber-600 text-amber-50">
              Educational Tool
            </Badge>
            <Badge variant="secondary" className="bg-amber-600 text-amber-50">
              Interactive Experience
            </Badge>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-600">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-amber-800">
            <p className="text-lg leading-relaxed">
              This Enigma Machine simulator brings one of history's most significant cryptographic devices to life in
              your browser. Our goal is to provide an authentic, educational experience that honors the historical
              importance of the Enigma machine while making its complex mechanics accessible to modern learners.
            </p>
            <p className="leading-relaxed">
              Through interactive exploration, we aim to foster understanding of cryptography, computer science, and the
              pivotal role that code-breaking played in World War II. This project serves as both a tribute to the
              brilliant minds who created and ultimately defeated this cipher, and as an educational tool for future
              generations.
            </p>
          </CardContent>
        </Card>

        {/* Historical Impact */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Historical Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">The Machine</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-1 text-blue-600" />
                    <span>Invented in the 1920s by Arthur Scherbius</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-1 text-blue-600" />
                    <span>Used by German military from 1930-1945</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Cpu className="w-4 h-4 mt-1 text-blue-600" />
                    <span>158+ quintillion possible settings</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">The Breaking</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-1 text-green-600" />
                    <span>Polish mathematicians made initial breakthroughs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-4 h-4 mt-1 text-green-600" />
                    <span>Bletchley Park team led by Alan Turing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-1 text-green-600" />
                    <span>Shortened WWII by an estimated 2-4 years</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3">Why It Mattered</h4>
              <p className="text-blue-700 leading-relaxed">
                Breaking the Enigma code gave the Allies unprecedented insight into German military operations. This
                intelligence, codenamed "Ultra," influenced major strategic decisions including D-Day planning, the
                Battle of the Atlantic, and countless other operations. The mathematical and technological innovations
                developed to break Enigma laid the groundwork for modern computer science and cryptography.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Achievement */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800 flex items-center gap-2">
              <Cpu className="w-6 h-6" />
              Technical Achievement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <div className="text-sm text-blue-800">Rotor Wheels</div>
                <div className="text-xs text-blue-600 mt-1">Each with unique wiring</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">26</div>
                <div className="text-sm text-blue-800">Plugboard Pairs</div>
                <div className="text-xs text-blue-600 mt-1">Additional substitution layer</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
                <div className="text-sm text-blue-800">Key Changes</div>
                <div className="text-xs text-blue-600 mt-1">Rotors advance each letter</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3">How It Worked</h4>
              <p className="text-blue-700 leading-relaxed mb-4">
                The Enigma machine was a marvel of mechanical engineering. Each letter typed would:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-blue-700">
                <li>Pass through the plugboard (first substitution)</li>
                <li>Travel through three rotors in sequence (polyalphabetic cipher)</li>
                <li>Reflect off the reflector and return through rotors</li>
                <li>Pass through plugboard again (final substitution)</li>
                <li>Light up the encrypted letter on the lamp board</li>
              </ol>
              <p className="text-blue-700 leading-relaxed mt-4">
                The rotors would advance after each letter, creating a constantly changing cipher that was virtually
                unbreakable by hand calculation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Educational Value */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
          <CardHeader>
            <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Educational Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-green-800">For Students</h3>
                <ul className="space-y-2 text-green-700">
                  <li>• Hands-on cryptography experience</li>
                  <li>• Understanding of substitution ciphers</li>
                  <li>• Historical context of WWII</li>
                  <li>• Introduction to computer science concepts</li>
                  <li>• Mathematical thinking and problem-solving</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-green-800">For Educators</h3>
                <ul className="space-y-2 text-green-700">
                  <li>• Interactive teaching tool</li>
                  <li>• Cross-curricular connections</li>
                  <li>• Historical primary source simulation</li>
                  <li>• STEM education integration</li>
                  <li>• Critical thinking exercises</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-green-200">
              <h4 className="font-bold text-green-800 mb-3">Learning Objectives</h4>
              <div className="grid md:grid-cols-2 gap-4 text-green-700">
                <div>
                  <h5 className="font-semibold mb-2">Historical Understanding</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Role of cryptography in warfare</li>
                    <li>• Impact of code-breaking on WWII</li>
                    <li>• Development of early computers</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Technical Concepts</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Mechanical computing principles</li>
                    <li>• Cipher design and analysis</li>
                    <li>• Information security fundamentals</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legacy */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-800 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Legacy and Modern Relevance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-700">
            <p className="leading-relaxed">
              The story of the Enigma machine continues to resonate today. The mathematical techniques developed to
              break it laid the foundation for modern cryptography, computer science, and artificial intelligence. The
              collaborative effort at Bletchley Park demonstrated the power of interdisciplinary teamwork and the
              importance of diversity in problem-solving.
            </p>

            <div className="bg-white p-6 rounded-lg border border-purple-200">
              <h4 className="font-bold text-purple-800 mb-3">Modern Connections</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-purple-800 mb-2">Cryptography Today</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Internet security (HTTPS, SSL)</li>
                    <li>• Digital banking and commerce</li>
                    <li>• Secure messaging applications</li>
                    <li>• Blockchain and cryptocurrencies</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-purple-800 mb-2">Computing Heritage</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Early computer development</li>
                    <li>• Algorithm design principles</li>
                    <li>• Machine learning foundations</li>
                    <li>• Cybersecurity practices</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="leading-relaxed italic text-center text-purple-600 bg-white p-4 rounded-lg border border-purple-200">
              "The Enigma machine reminds us that security through obscurity is never enough. True security comes from
              mathematical rigor, open analysis, and constant vigilance."
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm space-y-2">
          <p>Built with respect for history and dedication to education</p>
          <p>In memory of all who served and sacrificed during World War II</p>
          <Separator className="my-4 bg-gray-600" />
          <p>© 2024 Enigma Machine Simulator • Educational Use • Open Source</p>
        </div>
      </div>
    </div>
  )
}
