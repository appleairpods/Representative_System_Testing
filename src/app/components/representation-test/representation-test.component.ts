import { Component } from '@angular/core';
import {
  QuestionAnswers,
  RepresentationalSystem,
  TestResults
} from '../../models/representation-test.model';
import {
  RANK_LABELS,
  REPRESENTATION_TEST_QUESTIONS
} from '../../data/representation-test.data';

type TestPhase = 'intro' | 'questions' | 'results';

const SYSTEMS: RepresentationalSystem[] = ['V', 'A', 'K', 'Ad'];

@Component({
  selector: 'app-representation-test',
  templateUrl: './representation-test.component.html',
  styleUrls: ['./representation-test.component.css']
})
export class RepresentationTestComponent {
  readonly questions = REPRESENTATION_TEST_QUESTIONS;
  readonly rankLabels = RANK_LABELS;
  readonly ranks = [4, 3, 2, 1];

  phase: TestPhase = 'intro';
  currentQuestionIndex = 0;
  answers: QuestionAnswers[] = this.createEmptyAnswers();
  results: TestResults | null = null;

  get currentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  get progressPercent(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get isCurrentQuestionComplete(): boolean {
    const ranks = this.answers[this.currentQuestionIndex].ranks;
    return SYSTEMS.every(system => ranks[system] !== null);
  }

  get canGoBack(): boolean {
    return this.currentQuestionIndex > 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  startTest(): void {
    this.phase = 'questions';
    this.currentQuestionIndex = 0;
    this.answers = this.createEmptyAnswers();
    this.results = null;
  }

  restartTest(): void {
    this.phase = 'intro';
    this.currentQuestionIndex = 0;
    this.answers = this.createEmptyAnswers();
    this.results = null;
  }

  getRank(system: RepresentationalSystem): number | null {
    return this.answers[this.currentQuestionIndex].ranks[system];
  }

  setRank(system: RepresentationalSystem, rank: number, event?: Event): void {
    const currentRanks = this.answers[this.currentQuestionIndex].ranks;
    const previousSystem = SYSTEMS.find(key => currentRanks[key] === rank);

    if (previousSystem && previousSystem !== system) {
      currentRanks[previousSystem] = currentRanks[system];
    }

    currentRanks[system] = rank;

    const button = event?.currentTarget;
    if (button instanceof HTMLButtonElement) {
      button.blur();
    }
  }

  goBack(): void {
    if (this.canGoBack) {
      this.currentQuestionIndex--;
    }
  }

  goNext(): void {
    if (!this.isCurrentQuestionComplete) {
      return;
    }

    if (this.isLastQuestion) {
      this.finishTest();
      return;
    }

    this.currentQuestionIndex++;
  }

  finishTest(): void {
    this.results = {
      answers: this.answers.map(answer => ({
        questionId: answer.questionId,
        ranks: { ...answer.ranks }
      })),
      systemTotals: this.calculateSystemTotals(),
      completedAt: new Date().toISOString()
    };
    this.phase = 'results';
  }

  getQuestionById(id: number) {
    return this.questions.find(question => question.id === id);
  }

  getCompactLine(questionId: number): string {
    const question = this.getQuestionById(questionId);
    const answer = this.results?.answers.find(item => item.questionId === questionId);

    if (!question || !answer) {
      return '';
    }

    return question.options
      .map(option => answer.ranks[option.system] ?? '-')
      .join(' · ');
  }

  private createEmptyAnswers(): QuestionAnswers[] {
    return this.questions.map(question => ({
      questionId: question.id,
      ranks: { V: null, A: null, K: null, Ad: null }
    }));
  }

  private calculateSystemTotals(): Record<RepresentationalSystem, number> {
    const totals: Record<RepresentationalSystem, number> = {
      V: 0,
      A: 0,
      K: 0,
      Ad: 0
    };

    for (const answer of this.answers) {
      for (const system of SYSTEMS) {
        totals[system] += answer.ranks[system] ?? 0;
      }
    }

    return totals;
  }
}
