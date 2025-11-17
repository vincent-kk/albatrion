/**
 * 기술 스택 감지 도구
 * package.json의 dependencies/devDependencies를 분석하여 사용 중인 프레임워크와 라이브러리 식별
 */

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface TechStack {
  frontend: {
    framework: string;
    language: string;
    ui_library: string;
  };
  backend: {
    framework: string;
    api_style: string;
  };
  state_management: string[];
  testing: {
    unit?: string;
    e2e?: string;
    mocking?: string;
  };
  database?: {
    orm?: string;
  };
}

/**
 * package.json에서 기술 스택 감지
 */
export function detectTechStack(packageJson: PackageJson): TechStack {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return {
    frontend: detectFrontend(allDeps),
    backend: detectBackend(allDeps),
    state_management: detectStateManagement(allDeps),
    testing: detectTesting(packageJson.devDependencies || {}),
    database: detectDatabase(allDeps),
  };
}

/**
 * 프론트엔드 프레임워크 감지
 */
function detectFrontend(deps: Record<string, string>) {
  let framework = 'unknown';
  let ui_library = 'custom';

  // Framework detection
  if (deps.next) framework = 'next';
  else if (deps.react || deps['react-dom']) framework = 'react';
  else if (deps.vue) framework = 'vue';
  else if (deps['@angular/core']) framework = 'angular';
  else if (deps.svelte) framework = 'svelte';

  // Language detection
  const language = deps.typescript ? 'typescript' : 'javascript';

  // UI library detection
  if (deps['antd-mobile']) ui_library = 'antd-mobile';
  else if (deps.antd) ui_library = 'antd';
  else if (deps['@mui/material']) ui_library = 'mui';
  else if (deps['@chakra-ui/react']) ui_library = 'chakra-ui';
  else if (deps.tailwindcss) ui_library = 'tailwind';
  // Shadcn 감지 (Radix UI 기반)
  else if (Object.keys(deps).some(key => key.startsWith('@radix-ui/'))) {
    ui_library = 'shadcn (radix-ui based)';
  }

  return { framework, language, ui_library };
}

/**
 * 백엔드 프레임워크 감지
 */
function detectBackend(deps: Record<string, string>) {
  let framework = 'unknown';
  let api_style = 'rest'; // default

  // Framework detection
  if (deps['@nestjs/core']) framework = 'nestjs';
  else if (deps.fastify) framework = 'fastify';
  else if (deps.koa) framework = 'koa';
  else if (deps.express) framework = 'express';
  else if (deps.next) framework = 'next'; // Next.js API routes

  // API style detection
  if (deps.graphql || deps['@apollo/server'] || deps['@apollo/client']) {
    api_style = 'graphql';
  } else if (deps['@trpc/server']) {
    api_style = 'trpc';
  }

  return { framework, api_style };
}

/**
 * 상태 관리 라이브러리 감지 (여러 개 사용 가능)
 */
function detectStateManagement(deps: Record<string, string>): string[] {
  const stateLibs: string[] = [];

  if (deps.jotai) stateLibs.push('jotai');
  if (deps.redux || deps['@reduxjs/toolkit']) stateLibs.push('redux');
  if (deps.zustand) stateLibs.push('zustand');
  if (deps.mobx) stateLibs.push('mobx');
  if (deps.recoil) stateLibs.push('recoil');
  if (deps['@apollo/client']) stateLibs.push('apollo-client');
  if (deps['@tanstack/react-query'] || deps['react-query']) {
    stateLibs.push('react-query');
  }

  return stateLibs;
}

/**
 * 테스팅 프레임워크 감지
 */
function detectTesting(devDeps: Record<string, string>) {
  const testing: {
    unit?: string;
    e2e?: string;
    mocking?: string;
  } = {};

  // Unit test frameworks
  if (devDeps.vitest) testing.unit = 'vitest';
  else if (devDeps.jest || devDeps['@jest/core']) testing.unit = 'jest';
  else if (devDeps.mocha) testing.unit = 'mocha';

  // E2E frameworks
  if (devDeps['@playwright/test'] || devDeps.playwright) testing.e2e = 'playwright';
  else if (devDeps.cypress) testing.e2e = 'cypress';

  // Mocking
  if (devDeps.msw) testing.mocking = 'msw';

  return testing;
}

/**
 * 데이터베이스 ORM 감지
 */
function detectDatabase(deps: Record<string, string>) {
  let orm: string | undefined;

  if (deps.prisma || deps['@prisma/client']) orm = 'prisma';
  else if (deps.typeorm) orm = 'typeorm';
  else if (deps['drizzle-orm']) orm = 'drizzle';
  else if (deps.sequelize) orm = 'sequelize';

  return orm ? { orm } : {};
}

// CLI 실행 예시
if (require.main === module) {
  const fs = require('fs');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const result = detectTechStack(packageJson);
  console.log(JSON.stringify(result, null, 2));
}
