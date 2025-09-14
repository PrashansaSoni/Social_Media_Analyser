import UserSearch from '@/components/Search/UserSearch'
import { Search } from 'lucide-react'

const SearchPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Discover People
                </h1>
                <p className="text-gray-600">Find and connect with users</p>
              </div>
            </div>
          </div>

          {/* Search Component */}
          <UserSearch />
        </div>
      </div>
    </div>
  )
}

export default SearchPage
