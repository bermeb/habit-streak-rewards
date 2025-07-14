import React, { useState } from 'react';
import { Plus, Search, RotateCcw } from 'lucide-react';
import { Habit } from '../types';
import { useHabits } from '../hooks/useHabits';
import { HabitCard } from './HabitCard';
import { HabitForm } from './HabitForm';

interface HabitsListProps {
  showAddButton?: boolean;
  maxItems?: number;
  category?: Habit['category'];
  className?: string;
}

export const HabitsList: React.FC<HabitsListProps> = ({
  showAddButton = true,
  maxItems,
  category,
  className = ''
}) => {
  const { habits, deleteHabit, getHabitsByCategory } = useHabits();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'streak' | 'created'>('streak');

  const getFilteredHabits = () => {
    let filteredHabits = category ? getHabitsByCategory(category) : habits;

    // Apply search filter
    if (searchTerm) {
      filteredHabits = filteredHabits.filter(habit =>
        habit.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply completion filter
    if (filter === 'active') {
      filteredHabits = filteredHabits.filter(habit => habit.streak > 0);
    } else if (filter === 'completed') {
      filteredHabits = filteredHabits.filter(habit => 
        habit.completedDates.includes(new Date().toISOString().split('T')[0])
      );
    }

    // Apply sorting
    filteredHabits = [...filteredHabits].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'streak':
          return b.streak - a.streak;
        case 'created':
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        default:
          return 0;
      }
    });

    return maxItems ? filteredHabits.slice(0, maxItems) : filteredHabits;
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleDelete = (habitId: string) => {
    if (window.confirm('Möchtest du dieses Habit wirklich löschen?')) {
      deleteHabit(habitId);
    }
  };

  const handleFormSave = (_habit: Habit) => {
    setEditingHabit(null);
    setShowForm(false);
  };

  const handleFormClose = () => {
    setEditingHabit(null);
    setShowForm(false);
  };

  const resetFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setSortBy('streak');
  };

  const filteredHabits = getFilteredHabits();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {category ? `${category} Habits` : 'Alle Habits'}
        </h2>
        {showAddButton && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            Habit hinzufügen
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Habits durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Alle</option>
            <option value="active">Aktive Streaks</option>
            <option value="completed">Heute erledigt</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'streak' | 'created')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="streak">Nach Streak</option>
            <option value="name">Nach Name</option>
            <option value="created">Nach Erstellung</option>
          </select>

          <button
            onClick={resetFilters}
            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Filter zurücksetzen"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-primary-500">{habits.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Gesamt Habits</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-500">
            {habits.filter(h => h.streak > 0).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Aktive Streaks</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-500">
            {Math.max(...habits.map(h => h.streak), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Längster Streak</div>
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            Keine Habits gefunden
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Versuche deine Filter zu ändern'
              : 'Erstelle dein erstes Habit um loszulegen'
            }
          </p>
          {showAddButton && (!searchTerm && filter === 'all') && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Erstes Habit erstellen
            </button>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <HabitForm
          habit={editingHabit || undefined}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};