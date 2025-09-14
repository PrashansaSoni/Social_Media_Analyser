import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'
import dagre from 'cytoscape-dagre'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize,
  Users,
  Navigation,
  Target
} from 'lucide-react'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

// Register cytoscape extensions
cytoscape.use(coseBilkent)
cytoscape.use(dagre)

const NetworkGraph = ({ 
  graphData, 
  onNodeClick, 
  selectedNodes = [], 
  highlightedPath = [],
  onPathFind 
}) => {
  const cyRef = useRef(null)
  const containerRef = useRef(null)
  const [cy, setCy] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [pathMode, setPathMode] = useState(false)
  const [pathNodes, setPathNodes] = useState([])

  useEffect(() => {
    if (!containerRef.current || !graphData) return

    // Initialize Cytoscape
    const cytoscapeInstance = cytoscape({
      container: containerRef.current,
      elements: [
        ...graphData.nodes.map(node => ({
          data: {
            id: node.id,
            label: node.label,
            name: node.name,
            avatar: node.avatar,
            bio: node.bio,
            connections: node.connections
          }
        })),
        ...graphData.edges.map(edge => ({
          data: {
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target
          }
        }))
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3b82f6',
            'label': 'data(label)',
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'font-weight': 'bold',
            'width': 'mapData(connections, 0, 20, 30, 60)',
            'height': 'mapData(connections, 0, 20, 30, 60)',
            'border-width': 2,
            'border-color': '#1e40af',
            'text-outline-width': 2,
            'text-outline-color': '#1e40af'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#ef4444',
            'border-color': '#dc2626',
            'text-outline-color': '#dc2626'
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'background-color': '#10b981',
            'border-color': '#059669',
            'text-outline-color': '#059669'
          }
        },
        {
          selector: 'node.path-node',
          style: {
            'background-color': '#f59e0b',
            'border-color': '#d97706',
            'text-outline-color': '#d97706'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'width': 4,
            'line-color': '#10b981',
            'target-arrow-color': '#10b981'
          }
        },
        {
          selector: 'edge.path-edge',
          style: {
            'width': 4,
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b'
          }
        }
      ],
      layout: {
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 1000,
        nodeRepulsion: 4500,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10
      },
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.2
    })

    setCy(cytoscapeInstance)
    cyRef.current = cytoscapeInstance

    return () => {
      if (cytoscapeInstance) {
        cytoscapeInstance.destroy()
      }
    }
  }, [graphData])

  // Separate useEffect for event listeners to handle pathMode changes
  useEffect(() => {
    if (!cy) return

    // Remove existing event listeners
    cy.off('tap', 'node')
    cy.off('tap')

    // Add event listeners
    cy.on('tap', 'node', (event) => {
      const node = event.target
      const nodeData = node.data()
      
      if (pathMode) {
        handlePathNodeSelection(nodeData)
      } else {
        setSelectedUser(nodeData)
        if (onNodeClick) {
          onNodeClick(nodeData)
        }
      }
    })

    cy.on('tap', (event) => {
      if (event.target === cy) {
        setSelectedUser(null)
        if (!pathMode) {
          cy.nodes().removeClass('highlighted')
          cy.edges().removeClass('highlighted')
        }
      }
    })
  }, [cy, pathMode, onNodeClick])

  // Handle path node selection
  const handlePathNodeSelection = (nodeData) => {
    if (!cy) return
    
    setPathNodes(currentPathNodes => {
      if (currentPathNodes.length === 0) {
        // First selection
        cy.getElementById(nodeData.id).addClass('path-node')
        toast.success(`Selected ${nodeData.name}. Now select the destination.`)
        return [nodeData]
      } else if (currentPathNodes.length === 1) {
        // Second selection
        if (currentPathNodes[0].id === nodeData.id) {
          // Clicking on the start user again - reset path mode
          cy.getElementById(nodeData.id).removeClass('path-node')
          cy.edges().removeClass('path-edge')
          toast.success(`Path mode reset. Click any user to start a new path.`)
          return []
        }
        
        cy.getElementById(nodeData.id).addClass('path-node')
        
        // Find path between the two nodes
        if (onPathFind) {
          onPathFind(currentPathNodes[0].id, nodeData.id)
        }
        
        toast.success(`Finding path from ${currentPathNodes[0].name} to ${nodeData.name}...`)
        return [...currentPathNodes, nodeData]
      } else {
        // Third or more selections
        if (currentPathNodes[0].id === nodeData.id) {
          // Clicking on the start user - reset path mode
          cy.nodes().removeClass('path-node')
          cy.edges().removeClass('path-edge')
          toast.success(`Path mode reset. Click any user to start a new path.`)
          return []
        } else {
          // Replace the destination user
          const newPathNodes = [currentPathNodes[0], nodeData]
          
          // Remove path-node class from the previous second selection
          cy.getElementById(currentPathNodes[1].id).removeClass('path-node')
          // Add path-node class to the new selection
          cy.getElementById(nodeData.id).addClass('path-node')
          
          // Clear previous path highlights
          cy.edges().removeClass('path-edge')
          
          // Find new path
          if (onPathFind) {
            onPathFind(currentPathNodes[0].id, nodeData.id)
          }
          
          toast.success(`Changed destination to ${nodeData.name}. Finding new path...`)
          return newPathNodes
        }
      }
    })
  }

  // Update highlighted path
  useEffect(() => {
    if (!cy || !highlightedPath.length) return

    // Clear previous highlights
    cy.nodes().removeClass('path-node')
    cy.edges().removeClass('path-edge')

    // Highlight path nodes
    highlightedPath.forEach(nodeId => {
      cy.getElementById(nodeId).addClass('path-node')
    })

    // Highlight path edges
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      const sourceId = highlightedPath[i]
      const targetId = highlightedPath[i + 1]
      
      // Find edge between these nodes
      const edge = cy.edges().filter(edge => {
        const source = edge.source().id()
        const target = edge.target().id()
        return (source === sourceId && target === targetId) || 
               (source === targetId && target === sourceId)
      })
      
      edge.addClass('path-edge')
    }

    // Fit to path
    if (highlightedPath.length > 0) {
      const pathElements = cy.getElementById(highlightedPath.join(', '))
      cy.fit(pathElements, 50)
    }
  }, [highlightedPath, cy])

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (!cy || !query.trim()) {
      cy.nodes().removeClass('highlighted')
      return
    }

    const searchTerm = query.toLowerCase()
    cy.nodes().removeClass('highlighted')
    
    const matchingNodes = cy.nodes().filter(node => {
      const data = node.data()
      return data.label.toLowerCase().includes(searchTerm) ||
             data.name.toLowerCase().includes(searchTerm)
    })

    matchingNodes.addClass('highlighted')
    
    if (matchingNodes.length > 0) {
      cy.fit(matchingNodes, 50)
    }
  }

  // Graph controls
  const zoomIn = () => cy?.zoom(cy.zoom() * 1.2)
  const zoomOut = () => cy?.zoom(cy.zoom() * 0.8)
  const resetView = () => cy?.fit()
  const centerGraph = () => cy?.center()

  const togglePathMode = () => {
    const newPathMode = !pathMode
    setPathMode(newPathMode)
    setPathNodes([])
    if (cy) {
      cy.nodes().removeClass('path-node')
      cy.edges().removeClass('path-edge')
    }
    toast.success(newPathMode ? 'Path mode enabled. Click two users to find the shortest path.' : 'Path mode disabled')
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border-b">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            variant={pathMode ? "default" : "outline"}
            onClick={togglePathMode}
            className="flex items-center space-x-2"
          >
            <Navigation className="h-4 w-4" />
            <span>Path Mode</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetView}>
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={centerGraph}>
            <Target className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Graph Container */}
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className="w-full h-full graph-container"
            style={{ minHeight: '600px' }}
          />
          
          {pathMode && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Navigation className="h-4 w-4 text-primary" />
                <span className="font-medium">Path Mode Active</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Click two users to find shortest path
              </p>
              {pathNodes.length > 0 && (
                <div className="mt-2 text-xs">
                  <p>Selected: {pathNodes.map(n => n.name).join(' → ')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Details Sidebar */}
        {selectedUser && !pathMode && (
          <div className="w-80 border-l bg-white">
            <Card className="h-full rounded-none border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.label} />
                    <AvatarFallback>
                      {getInitials(selectedUser.name.split(' ')[0], selectedUser.name.split(' ')[1])}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">@{selectedUser.label}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUser.bio && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Network Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connections</span>
                      <span className="font-medium">{selectedUser.connections}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedUser(null)
                      cy.nodes().removeClass('highlighted')
                    }}
                  >
                    Close Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Graph Statistics */}
      <div className="p-4 bg-muted/50 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{graphData?.nodes?.length || 0} Users</span>
            </span>
            <span>{graphData?.edges?.length || 0} Connections</span>
          </div>
          <div className="flex items-center space-x-4">
            {pathMode && (
              <span className="text-primary font-medium">
                Path Mode: {pathNodes.length}/2 users selected
              </span>
            )}
            <span>Zoom: {cy ? Math.round(cy.zoom() * 100) : 100}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkGraph
