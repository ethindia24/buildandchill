export async function POST() {
  try {
    const response = await fetch('https://api.huddle01.com/api/v1/create-room', {
      method: 'POST',
      body: JSON.stringify({
        title: 'BuildAndChill Room',
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.HUDDLE01_API_KEY!,
      },
    })

    const data = await response.json()
    console.log('Huddle01 response:', data) // Debug log
    
    if (!response.ok) {
      return Response.json({ error: data.message || 'Failed to create room' }, { status: response.status })
    }

    // Huddle01's API returns roomId in data.data.roomId
    const roomId = data.data?.roomId
    if (!roomId) {
      console.error('Invalid Huddle01 response:', data) // Debug log
      return Response.json({ error: 'No roomId in response' }, { status: 500 })
    }

    return Response.json({ roomId })
  } catch (error) {
    console.error('Failed to create Huddle01 room:', error)
    return Response.json({ error: 'Failed to create room' }, { status: 500 })
  }
} 