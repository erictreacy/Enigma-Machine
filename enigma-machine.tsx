"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Historical rotor wirings (I-V)
const ROTORS = {
  I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q", turnover: 16 },
  II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "E", turnover: 4 },
  III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V", turnover: 21 },
  IV: { wiring: "ESOVPZJAYQUIRHXLNFTGKDCMWB", notch: "J", turnover: 9 },
  V: { wiring: "VZBRGITYUPSDNHLXAWMJQOFECK", notch: "Z", turnover: 25 },
}

const REFLECTOR_B = "YRUHQSLDPXNGOKMIEBFZCWVJAT"
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// Keyboard layout like the original Enigma
const KEYBOARD_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O"],
  ["A", "S", "D", "F", "G", "H", "J", "K"],
  ["P", "Y", "X", "C", "V", "B", "N", "M", "L"],
]

interface RotorState {
  type: keyof typeof ROTORS
  position: number
  ringSetting: number
}

interface PlugboardPair {
  from: string
  to: string
}

export default function EnigmaMachine() {
  const [rotors, setRotors] = useState<RotorState[]>([
    { type: "I", position: 0, ringSetting: 0 },
    { type: "II", position: 0, ringSetting: 0 },
    { type: "III", position: 0, ringSetting: 0 },
  ])

  const [plugboard, setPlugboard] = useState<PlugboardPair[]>([])
  const [litLetter, setLitLetter] = useState<string>("")
  const [pressedKey, setPressedKey] = useState<string>("")
  const [message, setMessage] = useState("")
  const [encryptedMessage, setEncryptedMessage] = useState("")

  // Apply plugboard swapping
  const applyPlugboard = useCallback(
    (letter: string): string => {
      const pair = plugboard.find((p) => p.from === letter || p.to === letter)
      if (pair) {
        return pair.from === letter ? pair.to : pair.from
      }
      return letter
    },
    [plugboard],
  )

  // Encode through a rotor (forward direction)
  const encodeRotorForward = useCallback((letter: string, rotor: RotorState): string => {
    const { wiring } = ROTORS[rotor.type]
    const offset = (rotor.position - rotor.ringSetting + 26) % 26
    const inputPos = (ALPHABET.indexOf(letter) + offset) % 26
    const outputLetter = wiring[inputPos]
    const outputPos = (ALPHABET.indexOf(outputLetter) - offset + 26) % 26
    return ALPHABET[outputPos]
  }, [])

  // Encode through a rotor (backward direction)
  const encodeRotorBackward = useCallback((letter: string, rotor: RotorState): string => {
    const { wiring } = ROTORS[rotor.type]
    const offset = (rotor.position - rotor.ringSetting + 26) % 26
    const inputPos = (ALPHABET.indexOf(letter) + offset) % 26
    const inputLetter = ALPHABET[inputPos]
    const wiringPos = wiring.indexOf(inputLetter)
    const outputPos = (wiringPos - offset + 26) % 26
    return ALPHABET[outputPos]
  }, [])

  // Apply reflector
  const applyReflector = useCallback((letter: string): string => {
    const pos = ALPHABET.indexOf(letter)
    return REFLECTOR_B[pos]
  }, [])

  // Check if rotor should step
  const shouldStep = useCallback((rotor: RotorState): boolean => {
    const { turnover } = ROTORS[rotor.type]
    return rotor.position === turnover
  }, [])

  // Step rotors according to Enigma rules
  const stepRotors = useCallback(() => {
    setRotors((prevRotors) => {
      const newRotors = [...prevRotors]

      // Double stepping: if middle rotor is at notch, both middle and left step
      const middleAtNotch = shouldStep(newRotors[1])

      // Right rotor always steps
      newRotors[2].position = (newRotors[2].position + 1) % 26

      // Middle rotor steps if right rotor was at notch, or if middle is at notch
      if (shouldStep(prevRotors[2]) || middleAtNotch) {
        newRotors[1].position = (newRotors[1].position + 1) % 26
      }

      // Left rotor steps if middle rotor was at notch
      if (shouldStep(prevRotors[1])) {
        newRotors[0].position = (newRotors[0].position + 1) % 26
      }

      return newRotors
    })
  }, [shouldStep])

  // Encode a single letter
  const encodeLetter = useCallback(
    (letter: string): string => {
      if (!ALPHABET.includes(letter.toUpperCase())) return letter

      letter = letter.toUpperCase()

      // Step rotors first
      stepRotors()

      // Apply plugboard
      let current = applyPlugboard(letter)

      // Forward through rotors (right to left)
      current = encodeRotorForward(current, rotors[2])
      current = encodeRotorForward(current, rotors[1])
      current = encodeRotorForward(current, rotors[0])

      // Through reflector
      current = applyReflector(current)

      // Backward through rotors (left to right)
      current = encodeRotorBackward(current, rotors[0])
      current = encodeRotorBackward(current, rotors[1])
      current = encodeRotorBackward(current, rotors[2])

      // Apply plugboard again
      current = applyPlugboard(current)

      return current
    },
    [rotors, applyPlugboard, encodeRotorForward, encodeRotorBackward, applyReflector, stepRotors],
  )

  // Handle key press
  const handleKeyPress = (key: string) => {
    if (!ALPHABET.includes(key)) return

    setPressedKey(key)
    const encoded = encodeLetter(key)
    setLitLetter(encoded)
    setMessage((prev) => prev + key)
    setEncryptedMessage((prev) => prev + encoded)

    // Clear the pressed key and lit letter after a short delay
    setTimeout(() => {
      setPressedKey("")
      setLitLetter("")
    }, 200)
  }

  // Update rotor settings
  const updateRotor = (index: number, field: keyof RotorState, value: any) => {
    setRotors((prev) => prev.map((rotor, i) => (i === index ? { ...rotor, [field]: value } : rotor)))
  }

  // Add plugboard connection
  const addPlugConnection = (from: string, to: string) => {
    if (from === to) return

    // Remove existing connections for these letters
    const filtered = plugboard.filter((p) => p.from !== from && p.to !== from && p.from !== to && p.to !== to)
    setPlugboard([...filtered, { from, to }])
  }

  // Remove plugboard connection
  const removePlugConnection = (from: string, to: string) => {
    setPlugboard(plugboard.filter((p) => !(p.from === from && p.to === to) && !(p.from === to && p.to === from)))
  }

  // Reset machine
  const resetMachine = () => {
    setRotors([
      { type: "I", position: 0, ringSetting: 0 },
      { type: "II", position: 0, ringSetting: 0 },
      { type: "III", position: 0, ringSetting: 0 },
    ])
    setPlugboard([])
    setMessage("")
    setEncryptedMessage("")
    setLitLetter("")
    setPressedKey("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">ENIGMA</h1>
          <p className="text-amber-200">Chiffriermaschine M3</p>
        </div>

        {/* Main Machine Body */}
        <Card className="bg-gradient-to-b from-gray-900 to-black border-4 border-amber-600 shadow-2xl">
          <div className="p-8">
            {/* Rotor Assembly */}
            <div className="mb-8">
              <div className="bg-gradient-to-b from-amber-800 to-amber-900 p-6 rounded-lg border-2 border-amber-600 shadow-inner">
                <h3 className="text-amber-200 text-center mb-4 font-bold">WALZEN (ROTORS)</h3>
                <div className="flex justify-center gap-8">
                  {rotors.map((rotor, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-amber-300 mb-2">{["I", "II", "III"][index]}</div>

                      {/* Rotor Wheel */}
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full border-4 border-amber-500 shadow-lg flex items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full border-2 border-amber-400 flex items-center justify-center">
                            <span className="text-2xl font-bold text-amber-100">{ALPHABET[rotor.position]}</span>
                          </div>
                        </div>

                        {/* Position indicator */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-red-500 rounded-full"></div>
                      </div>

                      {/* Rotor Settings */}
                      <div className="mt-4 space-y-2">
                        <Select
                          value={rotor.type}
                          onValueChange={(value) => updateRotor(index, "type", value as keyof typeof ROTORS)}
                        >
                          <SelectTrigger className="w-16 h-8 bg-amber-800 border-amber-600 text-amber-100 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(ROTORS).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={rotor.position.toString()}
                          onValueChange={(value) => updateRotor(index, "position", Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-16 h-8 bg-amber-800 border-amber-600 text-amber-100 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALPHABET.split("").map((letter, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {letter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lamp Board */}
            <div className="mb-8">
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg border-2 border-gray-600 shadow-inner">
                <h3 className="text-gray-300 text-center mb-4 font-bold">LAMPENFELD</h3>
                <div className="space-y-2">
                  {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-2">
                      {row.map((letter) => (
                        <div
                          key={letter}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                            litLetter === letter
                              ? "bg-yellow-400 border-yellow-300 text-black shadow-lg shadow-yellow-400/50 animate-pulse"
                              : "bg-gray-700 border-gray-600 text-gray-300"
                          }`}
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Keyboard */}
            <div className="mb-8">
              <div className="bg-gradient-to-b from-gray-700 to-gray-800 p-6 rounded-lg border-2 border-gray-600 shadow-inner">
                <h3 className="text-gray-300 text-center mb-4 font-bold">TASTATUR</h3>
                <div className="space-y-2">
                  {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-2">
                      {row.map((letter) => (
                        <button
                          key={letter}
                          onClick={() => handleKeyPress(letter)}
                          className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all duration-100 ${
                            pressedKey === letter
                              ? "bg-gray-400 border-gray-300 text-black transform translate-y-1 shadow-inner"
                              : "bg-gradient-to-b from-gray-600 to-gray-700 border-gray-500 text-gray-200 shadow-md hover:from-gray-500 hover:to-gray-600 active:transform active:translate-y-1"
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Plugboard */}
            <div className="mb-6">
              <div className="bg-gradient-to-b from-amber-900 to-amber-950 p-6 rounded-lg border-2 border-amber-700 shadow-inner">
                <h3 className="text-amber-200 text-center mb-4 font-bold">STECKERBRETT</h3>

                {/* Plugboard Grid */}
                <div className="grid grid-cols-13 gap-1 mb-4">
                  {ALPHABET.split("").map((letter) => {
                    const connection = plugboard.find((p) => p.from === letter || p.to === letter)
                    const isConnected = !!connection
                    const connectedTo = connection
                      ? connection.from === letter
                        ? connection.to
                        : connection.from
                      : null

                    return (
                      <div key={letter} className="text-center">
                        <div className="text-xs text-amber-300 mb-1">{letter}</div>
                        <div
                          className={`w-6 h-8 rounded border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                            isConnected
                              ? "bg-red-600 border-red-400 text-white shadow-lg"
                              : "bg-amber-800 border-amber-600 text-amber-200 hover:bg-amber-700"
                          }`}
                          onClick={() => {
                            if (isConnected && connection) {
                              removePlugConnection(connection.from, connection.to)
                            }
                          }}
                        >
                          {connectedTo || "•"}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Quick Plug Connections */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {["AB", "CD", "EF", "GH", "IJ", "KL", "MN", "OP", "QR", "ST", "UV", "WX", "YZ"].map((pair) => (
                    <button
                      key={pair}
                      onClick={() => addPlugConnection(pair[0], pair[1])}
                      className="px-2 py-1 bg-amber-700 hover:bg-amber-600 text-amber-100 text-xs rounded border border-amber-600"
                    >
                      {pair[0]}↔{pair[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Display */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded border border-gray-600">
                <h4 className="text-gray-300 text-sm mb-2">EINGABE (Input)</h4>
                <div className="bg-black p-2 rounded font-mono text-green-400 text-sm min-h-[60px] overflow-auto">
                  {message || "..."}
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded border border-gray-600">
                <h4 className="text-gray-300 text-sm mb-2">AUSGABE (Output)</h4>
                <div className="bg-black p-2 rounded font-mono text-green-400 text-sm min-h-[60px] overflow-auto">
                  {encryptedMessage || "..."}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              <Button onClick={resetMachine} className="bg-red-700 hover:bg-red-600 text-white border-2 border-red-600">
                RÜCKSTELLUNG (Reset)
              </Button>
            </div>
          </div>
        </Card>

        {/* Historical Info */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Enigma-Maschine M3 • Wehrmacht • 1930-1945</p>
          <p>Drücken Sie die Tasten um zu verschlüsseln • Press keys to encrypt</p>
        </div>

        {/* Operating Instructions */}
        <Card className="mt-6 bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-600">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
              BEDIENUNGSANLEITUNG • OPERATING INSTRUCTIONS
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* German Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-800 border-b border-amber-600 pb-2">
                  🇩🇪 DEUTSCHE ANWEISUNGEN
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">1. WALZEN EINSTELLEN (Rotor Setup)</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Wählen Sie 3 verschiedene Walzen (I-V)</li>
                      <li>Stellen Sie die Anfangsposition ein (A-Z)</li>
                      <li>Ringstellung nach Tagesschlüssel</li>
                    </ul>
                  </div>

                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">2. STECKERBRETT (Plugboard)</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Verbinden Sie Buchstabenpaare mit Kabeln</li>
                      <li>Maximum 13 Verbindungen (26 Buchstaben)</li>
                      <li>Klicken Sie auf Schnellverbindungen</li>
                    </ul>
                  </div>

                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">3. VERSCHLÜSSELUNG</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Drücken Sie Tasten auf der Tastatur</li>
                      <li>Beobachten Sie das Lampenfeld</li>
                      <li>Notieren Sie die beleuchteten Buchstaben</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* English Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-800 border-b border-amber-600 pb-2">
                  🇺🇸 ENGLISH INSTRUCTIONS
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">1. ROTOR CONFIGURATION</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Select 3 different rotors (I-V) from dropdowns</li>
                      <li>Set initial positions (A-Z) - your "message key"</li>
                      <li>Ring settings modify internal wiring offset</li>
                    </ul>
                  </div>

                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">2. PLUGBOARD SETUP</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Connect letter pairs with virtual cables</li>
                      <li>Click quick-connect buttons (AB, CD, etc.)</li>
                      <li>Red sockets show active connections</li>
                      <li>Click connected sockets to disconnect</li>
                    </ul>
                  </div>

                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">3. OPERATION</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Press keyboard keys to encrypt letters</li>
                      <li>Watch the lamp board - lit bulb = encrypted letter</li>
                      <li>Rotors advance automatically after each letter</li>
                      <li>Same settings decrypt encrypted messages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Tutorial */}
            <div className="mt-8 bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-center">📋 QUICK START TUTORIAL</h3>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    1
                  </div>
                  <h4 className="font-bold mb-2">DAILY SETTINGS</h4>
                  <p className="text-sm">Set rotors to I-II-III, positions A-A-A, no plugs for testing</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    2
                  </div>
                  <h4 className="font-bold mb-2">TYPE MESSAGE</h4>
                  <p className="text-sm">Click keyboard keys - watch rotors turn and lamps light up</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    3
                  </div>
                  <h4 className="font-bold mb-2">DECRYPT</h4>
                  <p className="text-sm">Reset to same settings, type encrypted text to get original back</p>
                </div>
              </div>
            </div>

            {/* Historical Context */}
            <div className="mt-8 bg-gray-100 p-6 rounded-lg border border-gray-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚔️ HISTORICAL OPERATION</h3>

              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Daily Key Distribution</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Operators received monthly key sheets</li>
                    <li>Each day had specific rotor order & positions</li>
                    <li>Plugboard settings changed daily</li>
                    <li>Ring settings were monthly constants</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Message Procedure</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Set machine to daily key settings</li>
                    <li>Choose random 3-letter message key</li>
                    <li>Encrypt message key twice (security)</li>
                    <li>Reset rotors to message key position</li>
                    <li>Encrypt actual message content</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Security Note:</strong> The double encryption of message keys and predictable military
                  language patterns were key weaknesses that Allied cryptanalysts exploited to break Enigma codes.
                </p>
              </div>
            </div>

            {/* Example Usage */}
            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-300">
              <h3 className="text-lg font-bold text-blue-800 mb-4">💡 EXAMPLE: Encrypt "HELLO"</h3>

              <div className="space-y-4 text-sm">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-blue-800">Step 1: Setup</h4>
                    <p>Rotors: I-II-III</p>
                    <p>Positions: A-A-A</p>
                    <p>Plugs: None</p>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-blue-800">Step 2: Type H</h4>
                    <p>Press H key</p>
                    <p>Lamp G lights up</p>
                    <p>Rotors: A-A-B</p>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-blue-800">Step 3: Type E</h4>
                    <p>Press E key</p>
                    <p>Lamp C lights up</p>
                    <p>Rotors: A-A-C</p>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-blue-800">Continue...</h4>
                    <p>L → B, L → L, O → A</p>
                    <p>Result: GCBLA</p>
                    <p>Final: A-A-G</p>
                  </div>
                </div>

                <div className="bg-green-100 p-3 rounded border border-green-400">
                  <p className="text-green-800">
                    <strong>✅ To decrypt:</strong> Reset rotors to A-A-A, type "GCBLA" → get "HELLO" back!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Historical Info */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Enigma-Maschine M3 • Wehrmacht • 1930-1945</p>
          <p>Drücken Sie die Tasten um zu verschlüsseln • Press keys to encrypt</p>
        </div>

        {/* Operating Instructions */}
        <Card className="mt-6 bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-600">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
              BEDIENUNGSANLEITUNG • OPERATING INSTRUCTIONS
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* German Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-800 border-b border-amber-600 pb-2">
                  🇩🇪 DEUTSCHE ANWEISUNGEN
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">1. WALZEN EINSTELLEN (Rotor Setup)</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Wählen Sie 3 verschiedene Walzen (I-V)</li>
                      <li>Stellen Sie die Anfangsposition ein (A-Z)</li>
                      <li>Ringstellung nach Tagesschlüssel</li>
                    </ul>
                  </div>

                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">2. STECKERBRETT (Plugboard)</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Verbinden Sie Buchstabenpaare mit Kabeln</li>
                      <li>Maximum 13 Verbindungen (26 Buchstaben)</li>
                      <li>Klicken Sie auf Schnellverbindungen</li>
                    </ul>
                  </div>

                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">3. VERSCHLÜSSELUNG</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Drücken Sie Tasten auf der Tastatur</li>
                      <li>Beobachten Sie das Lampenfeld</li>
                      <li>Notieren Sie die beleuchteten Buchstaben</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* English Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-800 border-b border-amber-600 pb-2">
                  🇺🇸 ENGLISH INSTRUCTIONS
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">1. ROTOR CONFIGURATION</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Select 3 different rotors (I-V) from dropdowns</li>
                      <li>Set initial positions (A-Z) - your "message key"</li>
                      <li>Ring settings modify internal wiring offset</li>
                    </ul>
                  </div>

                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">2. PLUGBOARD SETUP</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Connect letter pairs with virtual cables</li>
                      <li>Click quick-connect buttons (AB, CD, etc.)</li>
                      <li>Red sockets show active connections</li>
                      <li>Click connected sockets to disconnect</li>
                    </ul>
                  </div>

                  <div className="bg-amber-200 p-3 rounded border-l-4 border-amber-600">
                    <h4 className="font-bold text-amber-900">3. OPERATION</h4>
                    <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
                      <li>Press keyboard keys to encrypt letters</li>
                      <li>Watch the lamp board - lit bulb = encrypted letter</li>
                      <li>Rotors advance automatically after each letter</li>
                      <li>Same settings decrypt encrypted messages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Tutorial */}
            <div className="mt-8 bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-center">📋 QUICK START TUTORIAL</h3>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    1
                  </div>
                  <h4 className="font-bold mb-2">DAILY SETTINGS</h4>
                  <p className="text-sm">Set rotors to I-II-III, positions A-A-A, no plugs for testing</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    2
                  </div>
                  <h4 className="font-bold mb-2">TYPE MESSAGE</h4>
                  <p className="text-sm">Click keyboard keys - watch rotors turn and lamps light up</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    3
                  </div>
                  <h4 className="font-bold mb-2">DECRYPT</h4>
                  <p className="text-sm">Reset to same settings, type encrypted text to get original back</p>
                </div>
              </div>
            </div>

            {/* Historical Context */}
            <div className="mt-8 bg-gray-100 p-6 rounded-lg border border-gray-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚔️ HISTORICAL OPERATION</h3>

              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Daily Key Distribution</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Operators received monthly key sheets</li>
                    <li>Each day had specific rotor order & positions</li>
                    <li>Plugboard settings changed daily</li>
                    <li>Ring settings were monthly constants</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Message Procedure</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Set machine to daily key settings</li>
                    <li>Choose random 3-letter message key</li>
                    <li>Encrypt message key twice (security)</li>
                    <li>Reset rotors to message key position</li>
                    <li>Encrypt actual message content</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Security Note:</strong> The double encryption of message keys and predictable military
                  language patterns were key weaknesses that Allied cryptanalysts exploited to break Enigma codes.
                </p>
              </div>
            </div>

            {/* Example Usage */}
            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-300">
              <h3 className="text-lg font-bold text-blue-800 mb-4">💡 EXAMPLE: Encrypt "HELLO"</h3>

              <div className="space-y-4 text-sm">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-blue-800">Step 1: Setup</h4>
                    <p>Rotors: I-II-III</p>
                    <p>Positions: A-A-A</p>
                    <p>Plugs: None</p>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-blue-800">Step 2: Type H</h4>
                    <p>Press H key</p>
                    <p>Lamp G lights up</p>
                    <p>Rotors: A-A-B</p>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-blue-800">Step 3: Type E</h4>
                    <p>Press E key</p>
                    <p>Lamp C lights up</p>
                    <p>Rotors: A-A-C</p>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-blue-800">Continue...</h4>
                    <p>L → B, L → L, O → A</p>
                    <p>Result: GCBLA</p>
                    <p>Final: A-A-G</p>
                  </div>
                </div>

                <div className="bg-green-100 p-3 rounded border border-green-400">
                  <p className="text-green-800">
                    <strong>✅ To decrypt:</strong> Reset rotors to A-A-A, type "GCBLA" → get "HELLO" back!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
