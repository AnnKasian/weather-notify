import { Test } from "@nestjs/testing";
import { SubscriptionService } from "../src/modules/subscription/subscription.js";
import { subscriptionMock } from "./mock-data/mock-data.js";
import { SubscriptionRepository } from "../src/modules/subscription/subscription.repository.js";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Frequency } from "../src/modules/subscription/enums/enums.js";

describe("SubscriptionService", () => {
  let subscriptionService: SubscriptionService;

  const mockSubscriptionRepository = {
    find: jest.fn(),
    create: jest.fn(),
    confirm: jest.fn(),
    delete: jest.fn(),
  };

  const mockEmailSender = {
    sendConfirmationEmail: jest.fn(),
  };

  const mockTokenFinder = {
    findToken: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SubscriptionRepository,
          useValue: mockSubscriptionRepository,
        },
      ],
    })
      .useMocker(() => mockEmailSender)
      .useMocker(() => mockTokenFinder)
      .compile();

    subscriptionService = moduleRef.get(SubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("subscribe", () => {
    test("should create subscription, send email, and return token", async () => {
      mockSubscriptionRepository.find.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockResolvedValue(
        subscriptionMock.responcefromRepository.emailNotExist
      );

      jest
        .spyOn(subscriptionService as any, "sendConfirmationEmail")
        .mockImplementation(async () => {});

      const result = await subscriptionService.subscribe(
        subscriptionMock.request.emailNotExist
      );

      expect(subscriptionService["sendConfirmationEmail"]).toHaveBeenCalledWith(
        subscriptionMock.responcefromRepository.emailNotExist
      );

      expect(result).toEqual(subscriptionMock.response.emailNotExist);
    });

    test("should send email again, and return token", async () => {
      mockSubscriptionRepository.find.mockResolvedValue(
        subscriptionMock.responcefromRepository.emailExist
      );

      jest
        .spyOn(subscriptionService as any, "sendConfirmationEmail")
        .mockImplementation(async () => {});

      const result = await subscriptionService.subscribe(
        subscriptionMock.request.emailExist
      );

      expect(subscriptionService["sendConfirmationEmail"]).toHaveBeenCalledWith(
        subscriptionMock.responcefromRepository.emailExist
      );

      expect(result).toEqual(subscriptionMock.response.emailExist);
    });

    test("should throw ConflictException if email is already confirmed", async () => {
      mockSubscriptionRepository.find.mockResolvedValue(
        subscriptionMock.responcefromRepository.emailExistAndConfirmed
      );

      await expect(
        subscriptionService.subscribe(
          subscriptionMock.request.emailExistAndConfirmed
        )
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("confirm", () => {
    test("should confirm subscription and return void", async () => {
      const findToken = jest
        .spyOn(subscriptionService as any, "findToken")
        .mockResolvedValue(subscriptionMock.responcefromRepository.emailExist);

      await subscriptionService.confirm(
        subscriptionMock.responcefromRepository.emailExist.token
      );

      expect(findToken).toHaveBeenCalledWith({
        token: subscriptionMock.responcefromRepository.emailExist.token,
      });
    });

    test("should throw NotFoundException if token not found", async () => {
      jest
        .spyOn(subscriptionService as any, "findToken")
        .mockRejectedValue(new NotFoundException("Token not found"));

      await expect(
        subscriptionService.confirm(
          subscriptionMock.responcefromRepository.emailNotExist.token
        )
      ).rejects.toThrow(NotFoundException);
    });

    test("should throw ConflictException if email is already confirmed", async () => {
      jest
        .spyOn(subscriptionService as any, "findToken")
        .mockResolvedValue(
          subscriptionMock.responcefromRepository.emailExistAndConfirmed
        );

      await expect(
        subscriptionService.confirm(
          subscriptionMock.responcefromRepository.emailExistAndConfirmed.token
        )
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("unsubscribe", () => {
    test("should unsubscribe and return void", async () => {
      const findToken = jest
        .spyOn(subscriptionService as any, "findToken")
        .mockResolvedValue(subscriptionMock.responcefromRepository.emailExist);

      await subscriptionService.unsubscribe(
        subscriptionMock.responcefromRepository.emailExist.token
      );

      expect(findToken).toHaveBeenCalledWith({
        token: subscriptionMock.responcefromRepository.emailExist.token,
      });
    });

    test("should throw NotFoundException if token not found", async () => {
      jest
        .spyOn(subscriptionService as any, "findToken")
        .mockRejectedValue(new NotFoundException("Token not found"));

      await expect(
        subscriptionService.unsubscribe(
          subscriptionMock.responcefromRepository.emailNotExist.token
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("sendHourlyEmails", () => {
    test("should call sendFrequencyEmails with Frequency.Hourly", async () => {
      const frequencyEmails = jest
        .spyOn(subscriptionService as any, "sendFrequencyEmails")
        .mockImplementation(async () => {});

      await subscriptionService.sendHourlyEmails();

      expect(frequencyEmails).toHaveBeenCalledWith(Frequency.Hourly);
    });
  });

  describe("sendDailyEmails", () => {
    test("should call sendFrequencyEmails with Frequency.Daily", async () => {
      const spy = jest
        .spyOn(subscriptionService as any, "sendFrequencyEmails")
        .mockImplementation(async () => {});

      await subscriptionService.sendDailyEmails();

      expect(spy).toHaveBeenCalledWith(Frequency.Daily);
    });
  });
});
